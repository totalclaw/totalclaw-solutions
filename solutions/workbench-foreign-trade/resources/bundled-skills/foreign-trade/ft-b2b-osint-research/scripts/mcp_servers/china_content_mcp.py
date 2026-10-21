"""
China Content MCP Server
知乎 + 百度 + 小红书 内容抓取工具

Tools:
  zhihu_article        — 抓取知乎专栏文章全文（通过文章ID或URL）
  zhihu_search         — 知乎站内搜索（返回文章/回答摘要+链接）
  baidu_search         — 百度搜索（比WebSearch对中文内容覆盖更全）
  baidu_baike          — 百度百科词条抓取
  xiaohongshu_search   — 小红书搜索（返回笔记标题+摘要+链接）
"""

import json
import re
import ssl
import time
import urllib.request
import urllib.parse
import urllib.error
import certifi
from fastmcp import FastMCP

_SSL_CTX = ssl.create_default_context(cafile=certifi.where())

mcp = FastMCP(
    "china-content",
    instructions=(
        "中国互联网内容抓取工具。"
        "zhihu_article: 抓取知乎专栏文章全文。"
        "zhihu_search: 知乎站内搜索。"
        "baidu_search: 百度搜索引擎（中文内容最全）。"
        "baidu_baike: 百度百科词条。"
        "xiaohongshu_search: 小红书笔记搜索。"
    ),
)

# ── Common HTTP helpers ──────────────────────────────────────────────────────

_DESKTOP_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
_MOBILE_UA = (
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
)

_MAX_RETRIES = 2
_RETRY_DELAY = 1


def _http_get(
    url: str,
    headers: dict | None = None,
    ua: str = _DESKTOP_UA,
    timeout: int = 30,
    retries: int = _MAX_RETRIES,
    decode: str = "utf-8",
) -> str:
    """HTTP GET with retry, returns raw text. Raises on complete failure."""
    last_err = None
    hdrs = {"User-Agent": ua, "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"}
    if headers:
        hdrs.update(headers)
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers=hdrs)
            with urllib.request.urlopen(req, timeout=timeout, context=_SSL_CTX) as resp:
                return resp.read().decode(decode, errors="replace")
        except urllib.error.HTTPError as e:
            code = e.code
            if code in (403, 401):
                raise RuntimeError(f"HTTP {code}: 平台拒绝访问 ({url})")
            if code >= 500 and attempt < retries:
                time.sleep(_RETRY_DELAY * (attempt + 1))
                last_err = f"HTTP {code}"
                continue
            raise RuntimeError(f"HTTP {code} ({url})")
        except (urllib.error.URLError, TimeoutError) as e:
            if attempt < retries:
                time.sleep(_RETRY_DELAY)
                last_err = str(e)
                continue
            raise RuntimeError(f"网络错误: {e} ({url})")
    raise RuntimeError(f"请求失败 ({retries + 1} 次): {last_err}")


def _http_get_json(url: str, headers: dict | None = None, ua: str = _DESKTOP_UA) -> dict:
    """HTTP GET returning parsed JSON."""
    text = _http_get(url, headers=headers, ua=ua)
    return json.loads(text)


def _clean_html(html: str) -> str:
    """Strip HTML tags and clean up whitespace. Simple but effective."""
    # Remove script/style blocks
    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", html, flags=re.DOTALL | re.IGNORECASE)
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", text)
    # Decode common entities
    for entity, char in [("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"),
                         ("&quot;", '"'), ("&#39;", "'"), ("&nbsp;", " ")]:
        text = text.replace(entity, char)
    # Clean whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _extract_between(html: str, start_pattern: str, end_pattern: str) -> str:
    """Extract text between two patterns in HTML."""
    m = re.search(f"{start_pattern}(.*?){end_pattern}", html, re.DOTALL)
    return m.group(1) if m else ""


# ── 知乎 (Zhihu) ─────────────────────────────────────────────────────────────

def _parse_zhihu_article_id(url_or_id: str) -> str:
    """Extract article ID from URL or return as-is if already an ID."""
    url_or_id = url_or_id.strip()
    # URL pattern: zhuanlan.zhihu.com/p/123456
    m = re.search(r"zhihu\.com/p/(\d+)", url_or_id)
    if m:
        return m.group(1)
    # Pure number
    if url_or_id.isdigit():
        return url_or_id
    return url_or_id


@mcp.tool()
def zhihu_article(url_or_id: str) -> str:
    """
    抓取知乎专栏文章全文内容。

    Args:
        url_or_id: 知乎文章URL（如 https://zhuanlan.zhihu.com/p/615761810）或纯文章ID（如 615761810）

    Returns:
        JSON with title, author, content (纯文本), created, updated, voteup_count, comment_count
    """
    article_id = _parse_zhihu_article_id(url_or_id)

    # 方法1: 尝试 API 端点（返回 JSON，最干净）
    api_url = f"https://zhuanlan.zhihu.com/api/articles/{article_id}"
    try:
        data = _http_get_json(
            api_url,
            headers={
                "Referer": f"https://zhuanlan.zhihu.com/p/{article_id}",
                "Origin": "https://zhuanlan.zhihu.com",
            },
        )
        content_html = data.get("content", "")
        content_text = _clean_html(content_html)
        author = data.get("author", {})
        return json.dumps({
            "source": "zhihu_api",
            "article_id": article_id,
            "title": data.get("title", ""),
            "author": author.get("name", ""),
            "author_headline": author.get("headline", ""),
            "content": content_text[:15000],  # 限制长度防止超大
            "content_length": len(content_text),
            "created": data.get("created", ""),
            "updated": data.get("updated", ""),
            "voteup_count": data.get("voteup_count", 0),
            "comment_count": data.get("comment_count", 0),
            "url": f"https://zhuanlan.zhihu.com/p/{article_id}",
        }, ensure_ascii=False, indent=2)
    except Exception:
        pass

    # 方法2: 直接抓取页面 HTML 并解析
    page_url = f"https://zhuanlan.zhihu.com/p/{article_id}"
    try:
        html = _http_get(page_url, headers={"Referer": "https://www.zhihu.com/"})

        # 从 HTML 中提取标题
        title = ""
        title_m = re.search(r'<h1[^>]*class="[^"]*Post-Title[^"]*"[^>]*>([^<]+)</h1>', html)
        if title_m:
            title = title_m.group(1).strip()
        else:
            title_m = re.search(r"<title>([^<]+)</title>", html, re.I)
            if title_m:
                title = title_m.group(1).strip().replace(" - 知乎", "")

        # 从 HTML 中提取正文
        content = ""
        # 知乎文章正文在 Post-RichTextContainer 中
        content_m = re.search(
            r'<div[^>]*class="[^"]*Post-RichTextContainer[^"]*"[^>]*>(.*?)</div>\s*(?:<div|</article)',
            html, re.DOTALL
        )
        if content_m:
            content = _clean_html(content_m.group(1))
        else:
            # 备选：RichText 内容
            content_m = re.search(
                r'<div[^>]*class="[^"]*RichText[^"]*"[^>]*>(.*?)</div>',
                html, re.DOTALL
            )
            if content_m:
                content = _clean_html(content_m.group(1))

        if not content:
            # 最后手段：提取 data-zop 或 initial data JSON
            json_m = re.search(r'<script[^>]*id="js-initialData"[^>]*>({.*?})</script>', html, re.DOTALL)
            if json_m:
                try:
                    init_data = json.loads(json_m.group(1))
                    # Navigate the initialData structure for article content
                    entities = init_data.get("initialState", {}).get("entities", {})
                    articles = entities.get("articles", {})
                    if article_id in articles:
                        art = articles[article_id]
                        content = _clean_html(art.get("content", ""))
                        title = title or art.get("title", "")
                except (json.JSONDecodeError, KeyError):
                    pass

        if content:
            return json.dumps({
                "source": "zhihu_html",
                "article_id": article_id,
                "title": title,
                "content": content[:15000],
                "content_length": len(content),
                "url": page_url,
            }, ensure_ascii=False, indent=2)

    except Exception as e:
        pass

    # 方法3: 用移动端 UA 尝试
    try:
        html = _http_get(page_url, ua=_MOBILE_UA)
        # 移动端页面结构更简单
        body_text = _clean_html(html)
        # 找到正文开始的位置（通常在标题后）
        if len(body_text) > 200:
            return json.dumps({
                "source": "zhihu_mobile",
                "article_id": article_id,
                "content": body_text[:15000],
                "content_length": len(body_text),
                "url": page_url,
                "note": "移动端抓取，内容可能包含导航等非正文元素",
            }, ensure_ascii=False, indent=2)
    except Exception:
        pass

    return json.dumps({
        "error": f"无法抓取知乎文章 {article_id}，所有方法均失败。可能需要登录态或文章已被删除。",
        "url": page_url,
        "suggestion": "尝试用 Playwright 打开此链接手动抓取",
    }, ensure_ascii=False, indent=2)


@mcp.tool()
def zhihu_search(query: str, limit: int = 10, content_type: str = "article") -> str:
    """
    知乎站内搜索，返回文章/回答的标题、摘要和链接。

    Args:
        query: 搜索关键词（如 "生命数字 九宫格 算法"）
        limit: 返回结果数量（默认10，最大20）
        content_type: 搜索类型 - "article"(专栏文章), "answer"(回答), "general"(综合)

    Returns:
        JSON with search results including title, excerpt, url, author
    """
    limit = min(limit, 20)
    encoded_q = urllib.parse.quote(query)

    type_map = {"article": "column", "answer": "answer", "general": "general"}
    search_type = type_map.get(content_type, "general")

    # 知乎搜索 API
    api_url = (
        f"https://www.zhihu.com/api/v4/search_v3"
        f"?t={search_type}&q={encoded_q}&offset=0&limit={limit}"
    )

    results = []

    # 方法1: API 搜索
    try:
        data = _http_get_json(
            api_url,
            headers={
                "Referer": f"https://www.zhihu.com/search?type=content&q={encoded_q}",
                "Origin": "https://www.zhihu.com",
            },
        )
        items = data.get("data", [])
        for item in items[:limit]:
            obj = item.get("object", item)
            highlight = item.get("highlight", {})

            result = {
                "type": obj.get("type", "unknown"),
                "title": _clean_html(highlight.get("title", obj.get("title", obj.get("name", "")))),
                "excerpt": _clean_html(highlight.get("description", obj.get("excerpt", obj.get("description", ""))))[:500],
                "url": obj.get("url", ""),
                "author": obj.get("author", {}).get("name", ""),
                "voteup_count": obj.get("voteup_count", 0),
                "comment_count": obj.get("comment_count", 0),
            }
            # 修复 URL 格式
            if result["url"] and not result["url"].startswith("http"):
                result["url"] = "https://www.zhihu.com" + result["url"]
            results.append(result)

        if results:
            return json.dumps({
                "source": "zhihu_api",
                "query": query,
                "total_results": len(results),
                "results": results,
            }, ensure_ascii=False, indent=2)
    except Exception:
        pass

    # 方法2: 抓取搜索结果页 HTML
    search_url = f"https://www.zhihu.com/search?type=content&q={encoded_q}"
    try:
        html = _http_get(search_url, headers={"Referer": "https://www.zhihu.com/"})

        # 从搜索页提取链接和标题
        # 知乎搜索结果通常包含 /question/ 和 /p/ 链接
        links = re.findall(
            r'href="(https://(?:zhuanlan\.)?zhihu\.com/(?:p|question)/\d+[^"]*)"[^>]*>([^<]+)',
            html,
        )
        seen = set()
        for url, title in links:
            url = url.split("?")[0]  # 去掉查询参数
            if url not in seen:
                seen.add(url)
                results.append({
                    "title": _clean_html(title),
                    "url": url,
                    "type": "article" if "/p/" in url else "question",
                })
                if len(results) >= limit:
                    break

        if results:
            return json.dumps({
                "source": "zhihu_html",
                "query": query,
                "total_results": len(results),
                "results": results,
                "note": "HTML 解析结果，摘要可能不完整",
            }, ensure_ascii=False, indent=2)
    except Exception:
        pass

    # 方法3: 用百度 site: 搜索知乎
    try:
        baidu_results = _baidu_search_internal(f"site:zhihu.com {query}", limit)
        if baidu_results:
            return json.dumps({
                "source": "baidu_site_search",
                "query": query,
                "total_results": len(baidu_results),
                "results": baidu_results,
                "note": "通过百度 site:zhihu.com 间接搜索",
            }, ensure_ascii=False, indent=2)
    except Exception:
        pass

    return json.dumps({
        "error": f"知乎搜索失败: '{query}'",
        "suggestion": "尝试用 baidu_search('site:zhihu.com {query}') 间接搜索",
    }, ensure_ascii=False, indent=2)


# ── 百度 (Baidu) ─────────────────────────────────────────────────────────────

def _baidu_search_internal(query: str, limit: int = 10) -> list:
    """Internal Baidu search, returns list of results."""
    encoded_q = urllib.parse.quote(query)
    # 百度搜索结果页
    url = f"https://www.baidu.com/s?wd={encoded_q}&rn={min(limit, 50)}"

    html = _http_get(url)

    results = []
    # 百度搜索结果块: <div class="result c-container ...">
    blocks = re.findall(
        r'<div[^>]*class="[^"]*result[^"]*c-container[^"]*"[^>]*>(.*?)</div>\s*(?=<div[^>]*class="[^"]*result|<!--)',
        html,
        re.DOTALL,
    )

    if not blocks:
        # 备选: 提取所有 <h3> 标签中的链接
        h3_links = re.findall(
            r'<h3[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>',
            html,
            re.DOTALL,
        )
        for href, title in h3_links[:limit]:
            title_text = _clean_html(title)
            if title_text and len(title_text) > 2:
                results.append({
                    "title": title_text,
                    "url": href,
                    "excerpt": "",
                })
    else:
        for block in blocks[:limit]:
            # 提取标题和链接
            title_m = re.search(r'<h3[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', block, re.DOTALL)
            if not title_m:
                continue
            href = title_m.group(1)
            title = _clean_html(title_m.group(2))

            # 提取摘要
            excerpt = ""
            # 百度摘要通常在 <span class="content-right_8Zs40"> 或类似元素
            for pattern in [
                r'<span[^>]*class="[^"]*content-right[^"]*"[^>]*>(.*?)</span>',
                r'<div[^>]*class="[^"]*c-abstract[^"]*"[^>]*>(.*?)</div>',
                r'<span[^>]*class="[^"]*c-color-text[^"]*"[^>]*>(.*?)</span>',
            ]:
                excerpt_m = re.search(pattern, block, re.DOTALL)
                if excerpt_m:
                    excerpt = _clean_html(excerpt_m.group(1))[:500]
                    break

            if title and len(title) > 2:
                results.append({
                    "title": title,
                    "url": href,
                    "excerpt": excerpt,
                })

    return results


@mcp.tool()
def baidu_search(query: str, limit: int = 10) -> str:
    """
    百度搜索引擎，对中文内容覆盖比 WebSearch 更全。
    适合搜索知乎、小红书、百度百科、CSDN 等中文平台内容。

    Args:
        query: 搜索关键词（如 "生命数字 九宫格 连线算法"）。
               支持 site: 语法（如 "site:zhihu.com 生命数字"）
        limit: 返回结果数量（默认10，最大50）

    Returns:
        JSON with search results including title, url, excerpt
    """
    limit = min(limit, 50)
    try:
        results = _baidu_search_internal(query, limit)
        return json.dumps({
            "source": "baidu",
            "query": query,
            "total_results": len(results),
            "results": results,
        }, ensure_ascii=False, indent=2)
    except Exception as e:
        return json.dumps({
            "error": f"百度搜索失败: {e}",
            "query": query,
        }, ensure_ascii=False, indent=2)


@mcp.tool()
def baidu_baike(keyword: str) -> str:
    """
    抓取百度百科词条内容，适合获取概念、人物、术语的中文权威定义。

    Args:
        keyword: 词条名称（如 "生命数字密码"、"毕达哥拉斯"）

    Returns:
        JSON with title, summary, sections (词条各段落), url
    """
    encoded = urllib.parse.quote(keyword)
    url = f"https://baike.baidu.com/item/{encoded}"

    try:
        html = _http_get(url, headers={"Referer": "https://baike.baidu.com/"})

        # 提取标题
        title = keyword
        title_m = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
        if title_m:
            title = _clean_html(title_m.group(1))

        # 提取摘要（词条第一段）
        summary = ""
        # 百科摘要通常在 class="lemma-summary" 或 "lemmaSummary" 中
        for pattern in [
            r'<div[^>]*class="[^"]*lemma-summary[^"]*"[^>]*>(.*?)</div>',
            r'<div[^>]*class="[^"]*lemmaSummary[^"]*"[^>]*>(.*?)</div>',
            r'<div[^>]*class="[^"]*J-lemma-content[^"]*"[^>]*>(.*?)</div>',
        ]:
            summary_m = re.search(pattern, html, re.DOTALL)
            if summary_m:
                summary = _clean_html(summary_m.group(1))
                break

        # 提取正文段落
        sections = []
        # 百科的段落标题在 <div class="para-title"> 中
        para_titles = re.findall(
            r'<div[^>]*class="[^"]*para-title[^"]*"[^>]*>.*?<h[23][^>]*>(.*?)</h[23]>',
            html, re.DOTALL
        )
        # 提取正文段落
        paragraphs = re.findall(
            r'<div[^>]*class="[^"]*para[^"]*"[^>]*>(.*?)</div>',
            html, re.DOTALL
        )
        para_texts = [_clean_html(p) for p in paragraphs if len(_clean_html(p)) > 20]

        # 组合段落
        if para_titles:
            sections = [{"heading": _clean_html(t)} for t in para_titles]
        if para_texts:
            # 合并为一个完整内容
            full_content = "\n\n".join(para_texts[:30])  # 限制段落数
        else:
            full_content = summary

        return json.dumps({
            "source": "baidu_baike",
            "title": title,
            "summary": summary[:1000],
            "content": full_content[:15000],
            "sections": [_clean_html(t) for t in para_titles][:20],
            "url": url,
        }, ensure_ascii=False, indent=2)

    except Exception as e:
        return json.dumps({
            "error": f"百度百科抓取失败: {e}",
            "keyword": keyword,
            "url": url,
        }, ensure_ascii=False, indent=2)


# ── 小红书 (Xiaohongshu / RED) ───────────────────────────────────────────────

@mcp.tool()
def xiaohongshu_search(query: str, limit: int = 10) -> str:
    """
    小红书笔记搜索。由于小红书反爬严格，使用多种策略组合获取内容。
    返回笔记标题、摘要和链接。

    注意：小红书以图片/短视频为主，纯文字内容有限。
    如果搜索失败，会自动 fallback 到百度 site:xiaohongshu.com 搜索。

    Args:
        query: 搜索关键词（如 "生命数字 图形 算法"）
        limit: 返回结果数量（默认10）

    Returns:
        JSON with search results including title, excerpt, url, note_id
    """
    limit = min(limit, 20)
    results = []

    # 方法1: 尝试小红书 web 搜索页面
    encoded_q = urllib.parse.quote(query)
    search_url = f"https://www.xiaohongshu.com/search_result?keyword={encoded_q}&source=web_search_result_note"

    try:
        html = _http_get(
            search_url,
            ua=_MOBILE_UA,
            headers={
                "Referer": "https://www.xiaohongshu.com/",
                "Accept": "text/html,application/xhtml+xml",
            },
        )

        # 小红书搜索结果中的笔记链接
        # 格式: /explore/笔记ID 或 /discovery/item/笔记ID
        note_links = re.findall(
            r'href="(/(?:explore|discovery/item)/([a-f0-9]+))"[^>]*>',
            html,
        )
        # 也尝试从 JSON 数据中提取（SPA 页面可能有 window.__INITIAL_STATE__）
        json_m = re.search(r'window\.__INITIAL_STATE__\s*=\s*({.*?})\s*</script>', html, re.DOTALL)
        if json_m:
            try:
                init_state = json.loads(json_m.group(1).replace("undefined", "null"))
                # 导航到搜索结果
                feed = init_state.get("search", {}).get("feeds", [])
                if not feed:
                    feed = init_state.get("feed", {}).get("feeds", [])
                for item in feed[:limit]:
                    note = item.get("note_card", item.get("noteCard", item))
                    note_id = item.get("id", note.get("noteId", ""))
                    results.append({
                        "title": note.get("display_title", note.get("title", "")),
                        "excerpt": note.get("desc", "")[:300],
                        "author": note.get("user", {}).get("nickname", ""),
                        "likes": note.get("liked_count", note.get("likedCount", "")),
                        "note_id": note_id,
                        "url": f"https://www.xiaohongshu.com/explore/{note_id}" if note_id else "",
                    })
            except (json.JSONDecodeError, KeyError):
                pass

        # 从 HTML 链接中提取
        if not results and note_links:
            seen = set()
            for path, note_id in note_links:
                if note_id not in seen:
                    seen.add(note_id)
                    results.append({
                        "title": "",
                        "note_id": note_id,
                        "url": f"https://www.xiaohongshu.com{path}",
                    })
                    if len(results) >= limit:
                        break

    except Exception:
        pass  # 预期会失败，继续 fallback

    # 方法2: Fallback 到百度 site:xiaohongshu.com
    if not results:
        try:
            baidu_results = _baidu_search_internal(f"site:xiaohongshu.com {query}", limit)
            # 提取小红书笔记ID
            for r in baidu_results:
                note_id_m = re.search(r"/(?:explore|discovery/item)/([a-f0-9]+)", r.get("url", ""))
                if note_id_m:
                    r["note_id"] = note_id_m.group(1)
                results.append(r)
            if results:
                return json.dumps({
                    "source": "baidu_site_search",
                    "query": query,
                    "total_results": len(results),
                    "results": results,
                    "note": "通过百度 site:xiaohongshu.com 间接搜索（小红书直接搜索被拦截）",
                }, ensure_ascii=False, indent=2)
        except Exception:
            pass

    # 方法3: Fallback 到百度普通搜索
    if not results:
        try:
            baidu_results = _baidu_search_internal(f"小红书 {query}", limit)
            results = baidu_results
            if results:
                return json.dumps({
                    "source": "baidu_general",
                    "query": query,
                    "total_results": len(results),
                    "results": results,
                    "note": "通过百度搜索'小红书'关键词间接获取（准确度较低）",
                }, ensure_ascii=False, indent=2)
        except Exception:
            pass

    if results:
        return json.dumps({
            "source": "xiaohongshu_web",
            "query": query,
            "total_results": len(results),
            "results": results,
        }, ensure_ascii=False, indent=2)

    return json.dumps({
        "error": f"小红书搜索失败: '{query}'",
        "suggestion": "小红书反爬严格，建议：1) 用 Playwright 手动浏览 2) 手动搜集截图后让我分析",
    }, ensure_ascii=False, indent=2)


@mcp.tool()
def xiaohongshu_note(note_url_or_id: str) -> str:
    """
    抓取小红书单篇笔记内容。

    Args:
        note_url_or_id: 笔记URL（如 https://www.xiaohongshu.com/explore/xxx）或笔记ID

    Returns:
        JSON with title, content, author, tags, likes
    """
    note_id = note_url_or_id.strip()
    # 从 URL 中提取 ID
    m = re.search(r"/(?:explore|discovery/item)/([a-f0-9]+)", note_id)
    if m:
        note_id = m.group(1)

    url = f"https://www.xiaohongshu.com/explore/{note_id}"

    # 尝试抓取笔记页面
    try:
        html = _http_get(
            url,
            ua=_MOBILE_UA,
            headers={"Referer": "https://www.xiaohongshu.com/"},
        )

        # 从 SSR 数据中提取
        json_m = re.search(r'window\.__INITIAL_STATE__\s*=\s*({.*?})\s*</script>', html, re.DOTALL)
        if json_m:
            try:
                state = json.loads(json_m.group(1).replace("undefined", "null"))
                note_data = state.get("note", {}).get("noteDetailMap", {})
                # 获取第一个笔记的数据
                for key, val in note_data.items():
                    note = val.get("note", {})
                    return json.dumps({
                        "source": "xiaohongshu_ssr",
                        "note_id": note_id,
                        "title": note.get("title", ""),
                        "content": note.get("desc", ""),
                        "author": note.get("user", {}).get("nickname", ""),
                        "tags": [t.get("name", "") for t in note.get("tagList", [])],
                        "likes": note.get("interactInfo", {}).get("likedCount", ""),
                        "collected": note.get("interactInfo", {}).get("collectedCount", ""),
                        "comments": note.get("interactInfo", {}).get("commentCount", ""),
                        "images": [img.get("urlDefault", "") for img in note.get("imageList", [])[:5]],
                        "url": url,
                    }, ensure_ascii=False, indent=2)
            except (json.JSONDecodeError, KeyError):
                pass

        # 从 meta 标签提取基本信息
        title = ""
        title_m = re.search(r'<meta[^>]*name="og:title"[^>]*content="([^"]*)"', html)
        if not title_m:
            title_m = re.search(r'<title>([^<]+)</title>', html, re.I)
        if title_m:
            title = title_m.group(1).strip()

        desc = ""
        desc_m = re.search(r'<meta[^>]*name="description"[^>]*content="([^"]*)"', html)
        if desc_m:
            desc = desc_m.group(1).strip()

        if title or desc:
            return json.dumps({
                "source": "xiaohongshu_meta",
                "note_id": note_id,
                "title": title,
                "content": desc,
                "url": url,
                "note": "仅获取到 meta 信息，完整内容需要 Playwright 抓取",
            }, ensure_ascii=False, indent=2)

    except Exception as e:
        pass

    return json.dumps({
        "error": f"无法抓取小红书笔记 {note_id}",
        "url": url,
        "suggestion": "小红书反爬严格，建议用 Playwright 打开链接手动抓取",
    }, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    mcp.run()
