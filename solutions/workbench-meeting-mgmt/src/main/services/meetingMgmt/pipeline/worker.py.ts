/**
 * 会议录音批量处理 worker 的 Python 源码：同一进程里常驻转写模型 + CAM++（声纹）。
 * 转写模型二选一：faster-whisper（模型名，如 large-v3），或 sherpa-onnx 的 SenseVoice / FireRedASR2-AED
 * （模型参数写成 `sherpa:{"kind":"sense_voice"|"fire_red_aed","dir":模型目录,"svDir":SenseVoice 目录}`）。
 *
 * 与 localAsrWorker / speakerWorker 用同一套解释器、同一份模型目录与插件目录，区别是：
 *   - 一次请求处理一批切片（按秒给起止），整段 16k wav 用 memmap 打开，切片不落盘、不走 base64；
 *   - 每个切片**单独**转写、单独提 192 维声纹（一批切片一起送进 Whisper 批量计算，但互不拼接）；
 *   - 可以起好几个并行（每个进程线程数由调用方定）。
 *
 * 协议：stdin 每行一个 JSON 请求，stdout 每行一个 `__TC_MM__{...}`。
 *   {"id":1,"op":"run","wav":路径,"slices":[[起,止],...],"asr":true,"emb":true,"lang":"zh","prompt":"..."}
 *     → 每片 {"id":1,"i":序号,"text":..,"lp":..,"ns":..,"emb":[..]|null} ，最后 {"id":1,"done":true}
 *   {"id":2,"op":"detect","wav":路径,"slices":[[起,止],...]} → {"id":2,"done":true,"lang":"zh","prob":0.9}
 * 这里的字符串只给开发日志看（界面文案在 TS 侧按错误码给中文），所以全用英文。
 */
export const MEETING_WORKER_PY = `
import sys, json, os, re, struct, time, traceback, warnings
from contextlib import contextmanager
warnings.filterwarnings("ignore")
for _s in (sys.stdin, sys.stdout, sys.stderr):
    try:
        if hasattr(_s, "reconfigure"):
            _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

@contextmanager
def _in_dir(d):
    prev = os.getcwd()
    try:
        if d:
            os.chdir(d)
        yield
    finally:
        try:
            os.chdir(prev)
        except Exception:
            pass

def _require_files(d, names):
    for fn in names:
        p = os.path.join(d, fn) if d else fn
        if not os.path.isfile(p) or os.path.getsize(p) <= 0:
            raise FileNotFoundError("model file missing or empty: %s" % p)

plugins = sys.argv[1] if len(sys.argv) > 1 else ""
model_name = sys.argv[2] if len(sys.argv) > 2 else ""
models_dir = sys.argv[3] if len(sys.argv) > 3 else ""
campp_path = sys.argv[4] if len(sys.argv) > 4 else ""
# 第二个声纹模型（ERes2NetV2，会议认人更准）：和 CAM++ 共用同一份 fbank 特征，两个都有就两个都算
campp2_path = sys.argv[6] if len(sys.argv) > 6 else ""
threads = int(sys.argv[5]) if len(sys.argv) > 5 and sys.argv[5] else 4

def emit(obj):
    sys.stdout.write("__TC_MM__" + json.dumps(obj, ensure_ascii=False) + "\\n")
    sys.stdout.flush()

# 先加载内置 numpy，再把 py-plugins 追加到 sys.path 末尾：py-plugins 只供 sherpa_onnx /
# kaldi_native_fbank 这类内置包里没有的可选扩展，绝不能抢在标准库与内置 numpy 前面造成同名遮蔽或循环导入。
def _load_numpy():
    # 导入 numpy 之前先把 sys.path 收窄到解释器自身目录（prefix / base_prefix 之下）：
    # 剔除 .pth / 环境变量 / 当前目录等外部注入的路径，避免里面的同名 numbers.py / numpy.py 遮蔽导致循环导入。
    # 必须事前做：numpy 的 C 扩展失败后同一进程里不能再加载第二次，事后重试无效。
    roots = tuple(set(os.path.normcase(os.path.abspath(r)) + os.sep for r in (sys.prefix, sys.base_prefix, sys.exec_prefix, sys.base_exec_prefix) if r))
    inside = lambda p: bool(p) and (os.path.normcase(os.path.abspath(p)) + os.sep).startswith(roots)
    sys.path[:] = [p for p in sys.path if inside(p)]
    nb = sys.modules.get("numbers")
    if nb is not None and not inside(getattr(nb, "__file__", "") or ""):
        sys.modules.pop("numbers", None)
    try:
        import numpy as m
        return m, None, None
    except Exception as e:
        return None, e, traceback.format_exc()[-1500:]

np, _np_err, _np_tb = _load_numpy()
if np is None:
    np_file = getattr(sys.modules.get("numpy"), "__file__", None)
    detail = "exe=%s | py=%s | np_file=%s | sys.path=%s | tb=%s" % (
        sys.executable, sys.version.split()[0], np_file, sys.path[:8], _np_tb,
    )
    emit({"ready": False, "error": "numpy unavailable: %s" % _np_err, "detail": detail})
    sys.exit(0)

if plugins and plugins not in sys.path:
    sys.path.append(plugins)

asr = None
asr_err = None
sherpa = None
sherpa_kind = None
sherpa_sv = None  # FireRedASR2 的兜底：同一片 SenseVoice 也转一遍，FireRed 漏字 / 复读 / 噪声里跑飞时用它
if model_name.startswith("sherpa:"):
    try:
        cfg = json.loads(model_name[len("sherpa:"):])
        sherpa_kind = cfg.get("kind")
        d = cfg.get("dir") or ""
        import sherpa_onnx
        if sherpa_kind == "sense_voice":
            _require_files(d, ("model.int8.onnx", "tokens.txt"))
            with _in_dir(d):
                sherpa = sherpa_onnx.OfflineRecognizer.from_sense_voice(
                    model="model.int8.onnx", tokens="tokens.txt",
                    num_threads=threads, use_itn=True, language="auto")
        elif sherpa_kind == "fire_red_aed":
            _require_files(d, ("encoder.int8.onnx", "decoder.int8.onnx", "tokens.txt"))
            with _in_dir(d):
                sherpa = sherpa_onnx.OfflineRecognizer.from_fire_red_asr(
                    encoder="encoder.int8.onnx", decoder="decoder.int8.onnx",
                    tokens="tokens.txt", num_threads=threads)
            sv_dir = cfg.get("svDir") or ""
            if sv_dir:
                try:
                    _require_files(sv_dir, ("model.int8.onnx", "tokens.txt"))
                    with _in_dir(sv_dir):
                        sherpa_sv = sherpa_onnx.OfflineRecognizer.from_sense_voice(
                            model="model.int8.onnx", tokens="tokens.txt",
                            num_threads=max(2, threads // 2), use_itn=True, language="auto")
                except Exception:
                    sherpa_sv = None
        else:
            raise RuntimeError("unknown sherpa model kind: %s" % sherpa_kind)
    except Exception as e:
        sherpa = None
        asr_err = "sherpa model unavailable: %s" % e
    model_name_for_whisper = ""
else:
    model_name_for_whisper = model_name
if model_name_for_whisper:
    try:
        import ctranslate2
        from faster_whisper import WhisperModel
        device = "cuda" if ctranslate2.get_cuda_device_count() else "cpu"
        compute = "int8" if device == "cpu" and "int8" in ctranslate2.get_supported_compute_types("cpu") else "auto"
        last = None
        for root in ([models_dir, None] if models_dir else [None]):
            try:
                kw = dict(device=device, compute_type=compute, cpu_threads=threads, local_files_only=True)
                if root:
                    kw["download_root"] = root
                asr = WhisperModel(model_name_for_whisper, **kw)
                break
            except Exception as e:
                last = e
        if asr is None:
            asr_err = "model not cached (%s): %s" % (model_name_for_whisper, last)
    except Exception as e:
        asr_err = "faster-whisper unavailable: %s" % e

emb_model = None
emb_model2 = None
emb_err = None
fbank_impl = None
if campp_path or campp2_path:
    try:
        import onnxruntime as ort
        so = ort.SessionOptions()
        so.intra_op_num_threads = 2
        so.inter_op_num_threads = 1
        if campp_path:
            cdir, cbase = os.path.dirname(campp_path), os.path.basename(campp_path)
            _require_files(cdir, (cbase,))
            with _in_dir(cdir):
                emb_model = ort.InferenceSession(cbase, sess_options=so, providers=["CPUExecutionProvider"])
        if campp2_path:
            try:
                c2dir, c2base = os.path.dirname(campp2_path), os.path.basename(campp2_path)
                _require_files(c2dir, (c2base,))
                with _in_dir(c2dir):
                    emb_model2 = ort.InferenceSession(c2base, sess_options=so, providers=["CPUExecutionProvider"])
            except Exception as e2:
                emb_err = "speaker model 2 unavailable: %s" % e2
        try:
            import kaldi_native_fbank as knf
            fbank_impl = "knf"
        except Exception:
            fbank_impl = "numpy"
    except Exception as e:
        emb_err = "speaker model unavailable: %s" % e

has_asr = asr is not None or sherpa is not None
if model_name and not has_asr and not (campp_path or campp2_path):
    emit({"ready": False, "error": asr_err})
    sys.exit(0)

# ── 16k 单声道 16 位 wav：memmap 打开，切片直接取 ──
_pcm_cache = {}
def open_pcm(path):
    if path in _pcm_cache:
        return _pcm_cache[path]
    size = os.path.getsize(path)
    with open(path, "rb") as f:
        head = f.read(12)
        if head[:4] != b"RIFF" or head[8:12] != b"WAVE":
            raise ValueError("not a wav file")
        fmt = None
        pos = 12
        while pos + 8 <= size:
            f.seek(pos)
            ch = f.read(8)
            cid = ch[:4]
            csize = struct.unpack("<I", ch[4:8])[0]
            if cid == b"fmt ":
                fmt = f.read(min(csize, 40))
            elif cid == b"data":
                off = pos + 8
                avail = size - off
                n = avail if (csize == 0 or csize == 0xFFFFFFFF or csize > avail) else csize
                if fmt is None:
                    raise ValueError("wav without fmt")
                chs = struct.unpack("<H", fmt[2:4])[0]
                sr = struct.unpack("<I", fmt[4:8])[0]
                bits = struct.unpack("<H", fmt[14:16])[0]
                if chs != 1 or sr != 16000 or bits != 16:
                    raise ValueError("wav must be 16k mono s16")
                mm = np.memmap(path, dtype="<i2", mode="r", offset=off, shape=(n // 2,))
                _pcm_cache.clear()
                _pcm_cache[path] = mm
                return mm
            pos += 8 + csize + (csize % 2)
    raise ValueError("wav without data chunk")

def cut(pcm, s, e):
    a = max(0, int(s * 16000))
    b = min(len(pcm), int(e * 16000))
    return np.asarray(pcm[a:b], dtype=np.float32) / 32768.0

# ── 声纹：Kaldi fbank（与 speakerWorker 同参数）→ CAM++ ──
def _fbank_numpy(audio):
    # Kaldi 兼容的 80 维 fbank（kaldi_native_fbank 不在时兜底）：25ms 窗 / 10ms 移，去直流，预加重 0.97，povey 窗，512 点 FFT
    frame_len, shift, nfft = 400, 160, 512
    if len(audio) < frame_len:
        return np.zeros((0, 80), dtype=np.float32)
    n = 1 + (len(audio) - frame_len) // shift
    idx = np.arange(frame_len)[None, :] + shift * np.arange(n)[:, None]
    frames = audio[idx].astype(np.float64)
    frames = frames - frames.mean(axis=1, keepdims=True)
    pre = np.concatenate([frames[:, :1] * (1 - 0.97), frames[:, 1:] - 0.97 * frames[:, :-1]], axis=1)
    win = np.power(0.5 - 0.5 * np.cos(2 * np.pi * np.arange(frame_len) / (frame_len - 1)), 0.85)
    spec = np.abs(np.fft.rfft(pre * win, n=nfft)) ** 2
    def mel(f):
        return 1127.0 * np.log(1.0 + f / 700.0)
    lo, hi = mel(20.0), mel(8000.0)
    centers = np.linspace(lo, hi, 82)
    fft_mel = mel(np.arange(nfft // 2 + 1) * 16000.0 / nfft)
    bank = np.zeros((80, nfft // 2 + 1))
    for m in range(80):
        l, c, r = centers[m], centers[m + 1], centers[m + 2]
        up = (fft_mel - l) / (c - l)
        down = (r - fft_mel) / (r - c)
        bank[m] = np.maximum(0, np.minimum(up, down))
    feats = np.log(np.maximum(spec @ bank.T, np.finfo(np.float32).eps))
    return feats.astype(np.float32)

def fbank(audio):
    if fbank_impl == "knf":
        opts = knf.FbankOptions()
        opts.frame_opts.dither = 0
        opts.frame_opts.snip_edges = True
        opts.frame_opts.samp_freq = 16000
        opts.mel_opts.num_bins = 80
        opts.mel_opts.high_freq = 0
        f = knf.OnlineFbank(opts)
        f.accept_waveform(16000, audio.tolist())
        f.input_finished()
        if f.num_frames_ready == 0:
            return np.zeros((0, 80), dtype=np.float32)
        return np.stack([f.get_frame(i) for i in range(f.num_frames_ready)])
    return _fbank_numpy(audio)

def _run_emb(model, m):
    v = model.run(None, {model.get_inputs()[0].name: m[np.newaxis].astype(np.float32)})[0].reshape(-1)
    norm = float(np.linalg.norm(v))
    if not np.isfinite(v).all() or norm < 1e-8:
        return None
    return [round(float(x), 6) for x in (v / norm)]

def embeddings(audio):
    """(CAM++ 声纹, ERes2NetV2 声纹)：同一份 fbank（去均值）送进两个模型；哪个模型没有就是 None"""
    if (emb_model is None and emb_model2 is None) or len(audio) < 16000 * 0.3:
        return None, None
    m = fbank(audio)
    if len(m) < 10:
        return None, None
    m = m - m.mean(axis=0, keepdims=True)
    return (_run_emb(emb_model, m) if emb_model is not None else None,
            _run_emb(emb_model2, m) if emb_model2 is not None else None)

def embedding(audio):
    return embeddings(audio)[0]

# ── 转写：每个切片单独转写（切片已经按停顿切好，不再跑 VAD；静音幻听按 Whisper 自己的置信过滤）──
#
# 不把几片拼进一个 30 秒窗口一起转：实测（用户 67 分钟录音）拼窗后遇到难懂的一窗，Whisper 只出一个
# 跨 20 秒的段、十来个字，后面的话整段跳过；逐片转写同样的音频每片都有字。
# 逐片转写的代价是每片都要过一次 30 秒的编码器；用 BatchedInferencePipeline + clip_timestamps 把一批切片
# 一起送进编码器 / 解码器（每片仍是独立的输入，互不影响，只是批量计算），比一片一片地跑快。
def keep_segment(s):
    lp = float(getattr(s, "avg_logprob", 0.0) or 0.0)
    ns = float(getattr(s, "no_speech_prob", 0.0) or 0.0)
    if ns > 0.66 and lp < -0.8:
        return False
    if (getattr(s, "compression_ratio", 0.0) or 0.0) > 2.4:
        return False
    return True

def join_text(parts):
    text = ""
    for t in parts:
        t = t.strip()
        if not t:
            continue
        # 中文直接接；两边都是西文才补空格
        if text and text[-1].isascii() and not text[-1].isspace() and t[:1].isascii() and t[:1].isalnum():
            text += " "
        text += t
    return text

def summarize(segs):
    parts, lps, nss = [], [], []
    dropped = 0
    last = None
    for s in segs:
        t = (s.text or "").strip()
        if not t or t == last:
            continue
        last = t
        if not keep_segment(s):
            dropped += 1
            continue
        parts.append(t)
        lps.append(float(getattr(s, "avg_logprob", 0.0) or 0.0))
        nss.append(float(getattr(s, "no_speech_prob", 0.0) or 0.0))
    return {
        "text": join_text(parts),
        "lp": round(sum(lps) / len(lps), 3) if lps else None,
        "ns": round(sum(nss) / len(nss), 3) if nss else None,
        "dropped": dropped,
    }

def transcribe_one(audio, lang, prompt, beam):
    kw = {
        "beam_size": beam,
        "vad_filter": False,
        "condition_on_previous_text": False,
        "without_timestamps": True,
        "temperature": 0,
        "task": "transcribe",
    }
    if lang:
        kw["language"] = lang
    if prompt:
        kw["initial_prompt"] = prompt
    segs, info = asr.transcribe(audio, **kw)
    out = summarize(list(segs))
    return out, info.language, round(float(getattr(info, "language_probability", 0.0) or 0.0), 3)

batched = None
if asr is not None:
    try:
        from faster_whisper import BatchedInferencePipeline
        batched = BatchedInferencePipeline(asr)
    except Exception:
        batched = None

def transcribe_many(pieces, lang, prompt, beam):
    global batched
    if batched is None or len(pieces) < 2 or not lang:
        return [transcribe_one(a, lang, prompt, beam)[0] for a in pieces]
    cat = np.concatenate(pieces)
    clips = []
    pos = 0.0
    for a in pieces:
        d = len(a) / 16000.0
        clips.append({"start": pos, "end": pos + d})
        pos += d
    try:
        segs, _ = batched.transcribe(cat, language=lang, clip_timestamps=clips, batch_size=len(pieces), beam_size=beam,
                                     without_timestamps=True, initial_prompt=prompt, vad_filter=False, log_progress=False, temperature=0)
        segs = list(segs)
    except TypeError:
        # 旧版 faster-whisper 没有这些参数：退回逐片
        batched = None
        return [transcribe_one(a, lang, prompt, beam)[0] for a in pieces]
    groups = [[] for _ in pieces]
    starts = [c["start"] for c in clips]
    for s in segs:
        k = min(range(len(starts)), key=lambda j: abs(starts[j] - float(s.start)))
        groups[k].append(s)
    return [summarize(g) for g in groups]

# ── sherpa-onnx 引擎：一批一起解码；FireRedASR2 同一批再用 SenseVoice 转一遍做兜底 ──
_LOOP = re.compile(r"(.{2,12}?)\\1{3,}")
_LANG = {"zh": "zh", "yue": "yue", "en": "en", "ja": "ja", "ko": "ko", "chinese": "zh", "cantonese": "yue", "english": "en", "japanese": "ja", "korean": "ko"}

def _sherpa_lang(r):
    raw = (getattr(r, "lang", "") or "").strip().strip("<|>").lower()
    return _LANG.get(raw, raw if re.fullmatch(r"[a-z]{2,3}", raw or "") else None)

def _clean_sherpa(text, seconds):
    t = (text or "").strip()
    # 自回归解码在强噪声下偶尔复读同一小段：连续 4 次以上只留 1 次
    t = _LOOP.sub(lambda m: m.group(1), t)
    # 语速上限（每秒 12 字 + 20）：再长就是解码跑飞了，截掉
    cap = int(seconds * 12) + 20
    return t[:cap] if len(t) > cap else t

def _decode_batch(rec, pieces):
    streams = []
    for a in pieces:
        s = rec.create_stream()
        s.accept_waveform(16000, a)
        streams.append(s)
    rec.decode_streams(streams)
    return [s.result for s in streams]

def _plain(t):
    return re.sub(r"[\\s\\W_]+", "", t or "")

def _choose(q_raw, s_text):
    """FireRedASR2 和 SenseVoice 同一片的结果里挑一个。自回归解码偶尔整句只出两三个字、或在强噪声里复读跑飞；
    这时 SenseVoice 的结果更可信。返回 (文字, 是否用了兜底)。"""
    q, s = _plain(q_raw), _plain(s_text)
    if not s:
        return q_raw, False
    if _LOOP.search(q_raw or ""):
        return s_text, True
    if len(s) >= 8 and len(q) < 0.5 * len(s):
        return s_text, True
    if len(q) > 2 * len(s) + 10:
        return s_text, True
    return q_raw, False

def sherpa_many(pieces):
    if sherpa_kind == "sense_voice":
        results = _decode_batch(sherpa, pieces)
        return [{"text": _clean_sherpa(r.text, len(a) / 16000.0), "lp": None, "ns": None, "dropped": 0, "lang": _sherpa_lang(r)}
                for a, r in zip(pieces, results)]
    sv_results = _decode_batch(sherpa_sv, pieces) if sherpa_sv is not None else [None] * len(pieces)
    main_results = _decode_batch(sherpa, pieces)
    outs = []
    for a, svr, mr in zip(pieces, sv_results, main_results):
        q_raw = (mr.text or "").strip()
        sec = len(a) / 16000.0
        if svr is not None:
            text, fb = _choose(q_raw, (svr.text or "").strip())
            lang = _sherpa_lang(svr)
        else:
            text, fb, lang = q_raw, False, None
        outs.append({"text": _clean_sherpa(text, sec), "lp": None, "ns": None, "dropped": 0, "lang": lang, "fb": fb})
    return outs

emit({"ready": True, "asr": has_asr, "engine": sherpa_kind or ("whisper" if asr is not None else None), "asrError": asr_err, "emb": emb_model is not None or emb_model2 is not None, "emb2": emb_model2 is not None, "embError": emb_err, "fbank": fbank_impl, "model": model_name})

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        req = json.loads(line)
    except Exception:
        continue
    rid = req.get("id")
    try:
        pcm = open_pcm(req["wav"])
        slices = req.get("slices") or []
        op = req.get("op") or "run"
        if op == "detect":
            votes = {}
            if asr is None and sherpa is not None and sherpa_kind == "sense_voice":
                # 没有 Whisper：用 SenseVoice 自带的语种判断（一片一票，按票数）
                for r in sherpa_many([cut(pcm, s, min(e, s + 28)) for s, e in slices]):
                    if r.get("lang"):
                        votes.setdefault(r["lang"], []).append(1.0)
            for s, e in slices:
                if asr is None:
                    break
                _, lang, prob = transcribe_one(cut(pcm, s, min(e, s + 28)), None, None, 1)
                if lang:
                    votes.setdefault(lang, []).append(prob)
            if votes:
                lang = max(votes, key=lambda k: (len(votes[k]), sum(votes[k])))
                emit({"id": rid, "done": True, "lang": lang, "prob": round(sum(votes[lang]) / len(votes[lang]), 3)})
            else:
                emit({"id": rid, "done": True, "lang": None, "prob": 0})
            continue
        want_asr = bool(req.get("asr")) and has_asr
        want_emb = bool(req.get("emb")) and (emb_model is not None or emb_model2 is not None)
        lang = req.get("lang") or None
        prompt = (req.get("prompt") or "").strip() or None
        beam = int(req.get("beam") or 1)
        started = time.perf_counter()
        pieces = [cut(pcm, s, e) for s, e in slices]
        outs = [{"id": rid, "i": k} for k in range(len(pieces))]
        if want_asr:
            usable = [k for k, a in enumerate(pieces) if len(a) >= 1600]
            if usable:
                try:
                    chosen = [pieces[k] for k in usable]
                    res = sherpa_many(chosen) if sherpa is not None else transcribe_many(chosen, lang, prompt, beam)
                    for k, r in zip(usable, res):
                        outs[k].update(r)
                except Exception as ex:
                    for o in outs:
                        o["asrError"] = str(ex)[:200]
        if want_emb:
            for k, a in enumerate(pieces):
                try:
                    e1, e2 = embeddings(a)
                    outs[k]["emb"] = e1
                    if emb_model2 is not None:
                        outs[k]["emb2"] = e2
                except Exception as ex:
                    outs[k]["emb"] = None
                    outs[k]["embError"] = str(ex)[:200]
        ms = round((time.perf_counter() - started) * 1000)
        for o in outs:
            o["ms"] = ms
            emit(o)
        emit({"id": rid, "done": True})
    except Exception as e:
        emit({"id": rid, "done": True, "error": str(e)[:300]})
`;
