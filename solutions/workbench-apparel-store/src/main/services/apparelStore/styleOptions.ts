/**
 * 服装实体店智能体 · 造型选项库：背景 30 项、姿势 20 项、发型 25 项，每项带细分场景。
 *
 * 界面文字走 i18nT（中英阿三语）；`prompt` 是交给图像模型的固定英文画面描述，
 * 保证同一选项每次生成的风格一致 —— 它是发给模型的载荷，不进词典。
 * 清单与《服装实体店智能体 · AI 一键换装解决方案》第六章一一对应。
 */
import { t as i18nT } from '@totalclaw/i18n';
import type { ApAudience, ApStyleKind, ApStyleOption } from '@totalclaw/ipc-contracts';

export interface StyleVariantDef { id: string; label: string; prompt: string }
export interface StyleOptionDef extends Omit<ApStyleOption, 'variants'> { prompt: string; variants: StyleVariantDef[] }

const ALL: ApAudience[] = ['women', 'men', 'kids'];
const W: ApAudience[] = ['women'];
const WK: ApAudience[] = ['women', 'kids'];
const M: ApAudience[] = ['men'];
const K: ApAudience[] = ['kids'];

function o(kind: ApStyleKind, id: string, group: string, label: string, detail: string, prompt: string, variants: Array<[string, string]>, audience: ApAudience[] = ALL, needsUpload = false): StyleOptionDef {
  return {
    id, kind, group, label, detail, prompt, audience,
    variants: variants.map(([label2, p], i) => ({ id: `${id}-${i + 1}`, label: label2, prompt: p })),
    ...(needsUpload ? { needsUpload: true } : {}),
  };
}

export function backgroundOptions(): StyleOptionDef[] {
  const b = (id: string, group: string, label: string, detail: string, prompt: string, v: Array<[string, string]>, up = false) => o('background', id, group, label, detail, prompt, v, ALL, up);
  const city = i18nT('都市休闲');
  const home = i18nT('商务居家');
  const art = i18nT('文艺节庆');
  const nature = i18nT('自然户外');
  const sport = i18nT('运动度假');
  const studio = i18nT('棚拍与自定义');
  return [
    b('B01', city, i18nT('咖啡馆'), i18nT('文艺、暖光'), 'a cozy artisan coffee shop with warm light', [[i18nT('窗边暖光座位'), 'by a large window seat with warm afternoon sunlight slanting in'], [i18nT('吧台手冲区'), 'at a wooden coffee bar with espresso machine and pour-over kettles'], [i18nT('街角露天座'), 'at a street-corner outdoor café terrace with parasols, street softly blurred']]),
    b('B02', city, i18nT('书店'), i18nT('木质书架、安静'), 'a quiet bookstore with tall wooden bookshelves', [[i18nT('高墙木书架通道'), 'in an aisle between floor-to-ceiling wooden bookshelves'], [i18nT('阅读角沙发'), 'in a reading nook with a fabric armchair and a warm desk lamp'], [i18nT('旧书店暖黄灯光'), 'in a vintage second-hand bookshop under warm yellow bulbs']]),
    b('B03', city, i18nT('商场中庭'), i18nT('时尚、明亮'), 'a bright fashionable shopping mall atrium', [[i18nT('挑高玻璃穹顶中庭'), 'under a high glass dome atrium full of daylight'], [i18nT('扶梯旁品牌灯箱'), 'beside escalators with glowing brand light boxes'], [i18nT('精品橱窗前'), 'in front of an elegant boutique shop window']]),
    b('B04', city, i18nT('街头'), i18nT('涂鸦墙、霓虹灯、十字路口'), 'an urban street scene', [[i18nT('彩色涂鸦墙'), 'in front of a colorful graffiti wall'], [i18nT('夜晚霓虹招牌街'), 'on a night street glowing with neon signs'], [i18nT('斑马线十字路口'), 'on a zebra crossing at a city intersection, street-snap style']]),
    b('B05', city, i18nT('天桥'), i18nT('城市车流'), 'a city pedestrian overpass above traffic', [[i18nT('黄昏车流光轨'), 'at dusk with long-exposure light trails of traffic below'], [i18nT('白天城市天际线'), 'in daytime with the city skyline behind'], [i18nT('雨后反光路面'), 'after rain with reflective wet pavement']]),
    b('B06', city, i18nT('复古街道'), i18nT('欧式建筑'), 'a vintage European-style street', [[i18nT('石板路拱门小巷'), 'in a cobblestone alley with stone archways'], [i18nT('法式铁艺阳台街景'), 'on a Parisian street with wrought-iron balconies'], [i18nT('梧桐树下的老洋房'), 'under plane trees in front of an old colonial villa']]),
    b('B07', city, i18nT('现代建筑'), i18nT('几何线条'), 'modern architecture with geometric lines', [[i18nT('白色几何旋转楼梯'), 'on a white geometric spiral staircase'], [i18nT('清水混凝土墙面'), 'against a minimalist exposed-concrete wall'], [i18nT('玻璃幕墙倒影'), 'in front of a glass curtain wall with reflections']]),
    b('B08', city, i18nT('车站'), i18nT('月台、复古火车'), 'a railway station', [[i18nT('复古绿皮火车月台'), 'on a platform beside a vintage green train'], [i18nT('现代高铁站大厅'), 'in a bright modern high-speed rail station hall'], [i18nT('老式候车室长椅'), 'in an old waiting room with wooden benches']]),
    b('B09', city, i18nT('餐厅'), i18nT('浪漫烛光、户外餐位'), 'a stylish restaurant', [[i18nT('烛光晚餐桌'), 'at a romantic candle-lit dinner table'], [i18nT('户外花园餐位＋灯串'), 'at an outdoor garden table under string lights'], [i18nT('日式料理吧台'), 'at a Japanese omakase wooden counter']]),
    b('B10', city, i18nT('酒店大堂'), i18nT('奢华、水晶灯'), 'a luxurious hotel lobby', [[i18nT('水晶吊灯大堂'), 'under a grand crystal chandelier'], [i18nT('大理石旋转楼梯'), 'on a marble spiral staircase'], [i18nT('丝绒沙发休息区'), 'in a lounge with velvet sofas']]),
    b('B11', home, i18nT('办公室'), i18nT('现代办公桌、会议玻璃墙'), 'a modern office', [[i18nT('开放式工位'), 'in an open-plan office with modern desks'], [i18nT('玻璃会议室'), 'in a glass-walled meeting room'], [i18nT('落地窗高层办公室'), 'in a high-rise office with floor-to-ceiling windows and city view']]),
    b('B12', home, i18nT('家居客厅'), i18nT('沙发、落地窗'), 'a cozy living room', [[i18nT('北欧布艺沙发＋绿植'), 'with a Scandinavian fabric sofa and green plants'], [i18nT('落地窗晨光'), 'by floor-to-ceiling windows in soft morning light'], [i18nT('奶油风客厅＋地毯'), 'in a cream-toned living room with a fluffy rug']]),
    b('B13', home, i18nT('露台'), i18nT('城市夜景、绿植'), 'a rooftop terrace', [[i18nT('城市夜景天台'), 'on a rooftop at night with glittering city lights'], [i18nT('绿植花架阳台'), 'on a balcony filled with plants and flower racks'], [i18nT('日落屋顶露台'), 'on a rooftop terrace at golden sunset']]),
    b('B14', art, i18nT('艺术展'), i18nT('画廊白墙、雕塑'), 'an art exhibition', [[i18nT('白墙画廊'), 'in a white-walled gallery with framed paintings'], [i18nT('雕塑展厅'), 'in a sculpture hall'], [i18nT('光影装置艺术'), 'inside an immersive light installation']]),
    b('B15', art, i18nT('博物馆'), i18nT('古典建筑'), 'a museum with classical architecture', [[i18nT('罗马柱长廊'), 'in a colonnade of Roman columns'], [i18nT('古典穹顶大厅'), 'in a grand classical domed hall'], [i18nT('中式园林回廊'), 'in a traditional Chinese garden corridor']]),
    b('B16', art, i18nT('派对'), i18nT('灯光、气球'), 'a festive party', [[i18nT('生日气球墙'), 'in front of a birthday balloon wall'], [i18nT('香槟塔＋暖色灯串'), 'beside a champagne tower with warm string lights'], [i18nT('迪斯科球舞池'), 'on a dance floor under a disco ball']]),
    b('B17', art, i18nT('音乐节'), i18nT('舞台、人群'), 'an outdoor music festival', [[i18nT('舞台灯光前景'), 'in front of a stage with colorful lights'], [i18nT('草地人群（虚化）'), 'on a lawn with a blurred crowd'], [i18nT('彩旗营地'), 'at a campsite decorated with colorful flags']]),
    b('B18', art, i18nT('游乐园'), i18nT('摩天轮、旋转木马'), 'an amusement park', [[i18nT('摩天轮下'), 'under a big Ferris wheel'], [i18nT('旋转木马前'), 'in front of a merry-go-round'], [i18nT('夜晚彩灯步道'), 'on a promenade lit with colorful lights at night']]),
    b('B19', nature, i18nT('公园'), i18nT('长椅、草坪、樱花'), 'a city park', [[i18nT('樱花小径'), 'on a path lined with blooming cherry blossoms'], [i18nT('草坪野餐布'), 'on a green lawn with a picnic blanket'], [i18nT('林荫长椅'), 'by a bench on a tree-shaded path']]),
    b('B20', nature, i18nT('花园'), i18nT('鲜花、铁艺椅'), 'a flower garden', [[i18nT('玫瑰花墙'), 'in front of a wall of roses'], [i18nT('铁艺桌椅下午茶'), 'at a wrought-iron table set for afternoon tea'], [i18nT('玻璃温室花房'), 'inside a glass greenhouse full of flowers']]),
    b('B21', nature, i18nT('森林'), i18nT('阳光穿透树叶'), 'a forest', [[i18nT('丁达尔光束林间'), 'with god rays of sunlight streaming through the trees'], [i18nT('秋日落叶林'), 'in an autumn forest with fallen golden leaves'], [i18nT('竹林小径'), 'on a path through a bamboo grove']]),
    b('B22', nature, i18nT('湖边'), i18nT('栈道、游船'), 'a lakeside', [[i18nT('木栈道'), 'on a wooden boardwalk over the lake'], [i18nT('手划船码头'), 'at a small pier with rowing boats'], [i18nT('芦苇湖畔黄昏'), 'by reeds on the lakeshore at dusk']]),
    b('B23', nature, i18nT('海滩'), i18nT('夕阳、海浪'), 'a beach', [[i18nT('金色夕阳海岸'), 'on the shore at golden sunset'], [i18nT('白沙碧海'), 'on white sand with turquoise sea at noon'], [i18nT('礁石浪花'), 'on rocks with splashing waves']]),
    b('B24', nature, i18nT('山顶'), i18nT('云海、日出'), 'a mountain top', [[i18nT('云海日出'), 'above a sea of clouds at sunrise'], [i18nT('山间观景台栏杆'), 'at a mountain viewing deck railing'], [i18nT('高山草甸'), 'on an alpine meadow']]),
    b('B25', nature, i18nT('田野'), i18nT('麦浪、风车'), 'open countryside fields', [[i18nT('金色麦田'), 'in a golden wheat field'], [i18nT('风车花田'), 'in a flower field with a windmill'], [i18nT('油菜花田'), 'in a bright yellow rapeseed flower field']]),
    b('B26', sport, i18nT('健身房'), i18nT('镜子、器材'), 'a modern gym', [[i18nT('镜面力量器械区'), 'in a strength area with mirrors and equipment'], [i18nT('木地板瑜伽室'), 'in a yoga studio with wooden floor'], [i18nT('动感单车房'), 'in a spin-cycling room with neon lights']]),
    b('B27', sport, i18nT('游泳池'), i18nT('躺椅、遮阳伞'), 'a swimming pool', [[i18nT('度假酒店泳池'), 'by a resort hotel pool with palm trees'], [i18nT('无边泳池（海景）'), 'at an infinity pool overlooking the sea'], [i18nT('泳池边躺椅＋遮阳伞'), 'by lounge chairs and parasols at the poolside']]),
    b('B28', sport, i18nT('滑雪场'), i18nT('雪地、缆车'), 'a ski resort', [[i18nT('雪道远景'), 'on a snowy slope with mountains behind'], [i18nT('缆车站'), 'at a cable-car station'], [i18nT('雪中木屋'), 'in front of a snow-covered wooden chalet']]),
    b('B29', studio, i18nT('摄影棚'), i18nT('纯色背景／渐变'), 'a professional photo studio', [[i18nT('纯白无影墙'), 'against a seamless pure white backdrop, e-commerce style'], [i18nT('莫兰迪纯色墙'), 'against a muted Morandi-color backdrop'], [i18nT('柔和渐变背景'), 'against a soft gradient backdrop']]),
    b('B30', studio, i18nT('自定义上传'), i18nT('顾客自己的照片背景'), 'the uploaded background photo (third image), keep it recognizable', [[i18nT('顾客上传的照片'), 'use the uploaded photo as the background'], [i18nT('门店实景'), 'use the uploaded store photo as the background'], [i18nT('品牌活动主视觉'), 'use the uploaded campaign visual as the background']], true),
  ];
}

export function poseOptions(): StyleOptionDef[] {
  const p = (id: string, group: string, label: string, detail: string, prompt: string, v: Array<[string, string]>) => o('pose', id, group, label, detail, prompt, v);
  const stand = i18nT('站姿');
  const arm = i18nT('手臂动作');
  const move = i18nT('动态');
  const sit = i18nT('坐姿');
  const prop = i18nT('道具互动');
  return [
    p('P01', stand, i18nT('自然站立'), i18nT('双手下垂'), 'standing naturally with arms relaxed at the sides', [[i18nT('正面放松站'), 'facing the camera, relaxed'], [i18nT('重心放在一侧腿'), 'weight shifted onto one leg'], [i18nT('双脚轻交叉'), 'feet lightly crossed']]),
    p('P02', stand, i18nT('叉腰'), i18nT('单手／双手'), 'hands on hips', [[i18nT('单手叉腰'), 'one hand on the hip'], [i18nT('双手叉腰'), 'both hands on the hips'], [i18nT('侧身叉腰'), 'body turned slightly, hand on hip']]),
    p('P03', stand, i18nT('单手插兜'), '', 'one hand in a pocket', [[i18nT('正面插兜'), 'facing the camera, one hand in pocket'], [i18nT('侧身插兜'), 'side-on, one hand in pocket'], [i18nT('插兜低头看地面'), 'hand in pocket, looking down casually']]),
    p('P04', stand, i18nT('双手抱胸'), '', 'arms crossed over the chest', [[i18nT('正面抱胸'), 'facing the camera with arms crossed'], [i18nT('抱胸侧倚'), 'arms crossed, leaning slightly'], [i18nT('抱胸微笑看镜头'), 'arms crossed, smiling at the camera']]),
    p('P05', stand, i18nT('侧身站立'), i18nT('45 度／90 度'), 'standing side-on', [[i18nT('45 度侧身'), 'body turned 45 degrees'], [i18nT('90 度侧面'), 'full 90-degree side profile'], [i18nT('侧身回看镜头'), 'side-on, looking back at the camera']]),
    p('P12', stand, i18nT('靠墙'), i18nT('单脚蹬墙'), 'leaning against a wall', [[i18nT('单脚蹬墙'), 'one foot propped against the wall'], [i18nT('背靠墙抬头'), 'back against the wall, chin up'], [i18nT('侧肩倚墙'), 'shoulder leaning on the wall']]),
    p('P06', arm, i18nT('手臂抬起'), i18nT('挥手、展示袖子、遮阳'), 'one arm raised', [[i18nT('挥手打招呼'), 'waving hello'], [i18nT('抬臂展示袖型'), 'arm lifted to show the sleeve'], [i18nT('手搭额头遮阳'), 'hand shading the eyes from the sun']]),
    p('P07', move, i18nT('走路步态'), i18nT('动态模糊'), 'walking mid-stride, candid motion', [[i18nT('迎面走来'), 'walking towards the camera'], [i18nT('侧面行走'), 'walking past, seen from the side'], [i18nT('街拍抓拍'), 'street-snap mid-stride with clothes flowing']]),
    p('P08', move, i18nT('转身回眸'), '', 'turning back to look over the shoulder', [[i18nT('背身回头'), 'back to camera, looking over the shoulder'], [i18nT('半转身'), 'half-turned towards the camera'], [i18nT('甩发回眸'), 'hair flipping while glancing back']]),
    p('P09', move, i18nT('跳跃'), i18nT('开心、青春'), 'jumping joyfully', [[i18nT('腾空跳'), 'mid-air jump'], [i18nT('双臂张开'), 'jumping with arms spread wide'], [i18nT('原地小跳'), 'a small playful hop']]),
    p('P18', move, i18nT('跳舞动作'), i18nT('旋转、扭动'), 'dancing', [[i18nT('转圈裙摆散开'), 'twirling so the hem flares out'], [i18nT('扭身定格'), 'a twisting dance freeze'], [i18nT('舞步抬腿'), 'a dance step with one leg lifted']]),
    p('P19', move, i18nT('运动姿势'), i18nT('跑步、瑜伽、挥拍'), 'an athletic pose', [[i18nT('慢跑'), 'jogging'], [i18nT('瑜伽树式'), 'yoga tree pose'], [i18nT('网球挥拍'), 'swinging a tennis racket']]),
    p('P10', sit, i18nT('坐姿'), i18nT('沙发、椅子、台阶、地面'), 'sitting', [[i18nT('沙发靠坐'), 'sitting back on a sofa'], [i18nT('高脚椅'), 'sitting on a bar stool'], [i18nT('台阶坐'), 'sitting on steps'], [i18nT('地面盘腿'), 'sitting cross-legged on the floor']]),
    p('P11', sit, i18nT('翘腿坐'), '', 'sitting with legs crossed', [[i18nT('椅上翘腿'), 'on a chair, legs crossed'], [i18nT('沙发翘腿'), 'on a sofa, legs crossed'], [i18nT('吧台翘腿'), 'on a bar stool, legs crossed']]),
    p('P13', prop, i18nT('拿咖啡杯／饮料'), '', 'holding a coffee cup', [[i18nT('双手捧杯'), 'holding a cup with both hands'], [i18nT('边走边喝'), 'sipping while walking'], [i18nT('举杯微笑'), 'raising the cup and smiling']]),
    p('P14', prop, i18nT('翻书／看手机'), '', 'with a book or phone', [[i18nT('低头翻书'), 'looking down, flipping through a book'], [i18nT('看手机微笑'), 'smiling at a phone'], [i18nT('抱书站立'), 'standing holding books']]),
    p('P15', prop, i18nT('撑伞'), i18nT('晴天／雨天'), 'holding an umbrella', [[i18nT('晴天遮阳伞'), 'a parasol on a sunny day'], [i18nT('雨天透明伞'), 'a clear umbrella in the rain'], [i18nT('伞搭在肩上'), 'umbrella resting on the shoulder']]),
    p('P16', prop, i18nT('拎包／背包'), '', 'carrying a bag', [[i18nT('手提包'), 'holding a handbag'], [i18nT('单肩包'), 'a shoulder bag'], [i18nT('双肩包'), 'a backpack']]),
    p('P17', prop, i18nT('自拍姿势'), i18nT('手机前置视角'), 'selfie pose', [[i18nT('举手自拍（俯拍）'), 'arm raised taking a high-angle selfie'], [i18nT('对镜自拍（全身）'), 'full-body mirror selfie'], [i18nT('比耶'), 'making a peace sign']]),
    p('P20', prop, i18nT('互动姿势'), i18nT('与虚拟宠物／孩子／朋友'), 'interacting with a companion', [[i18nT('牵狗散步'), 'walking a dog on a leash'], [i18nT('抱孩子（亲子装）'), 'holding a child'], [i18nT('闺蜜挽手'), 'arm in arm with a friend']]),
  ];
}

export function hairOptions(): StyleOptionDef[] {
  const h = (id: string, group: string, label: string, detail: string, prompt: string, v: Array<[string, string]>, aud: ApAudience[]) => o('hair', id, group, label, detail, prompt, v, aud);
  const def = i18nT('默认');
  const long = i18nT('长发');
  const mid = i18nT('中短发');
  const curl = i18nT('卷发');
  const tied = i18nT('扎发');
  const hat = i18nT('帽饰');
  const men = i18nT('男装补充');
  const kids = i18nT('童装补充');
  return [
    h('H00', def, i18nT('保持本人发型'), i18nT('不改发型，只换衣服'), 'KEEP_ORIGINAL', [], ALL),
    h('H01', long, i18nT('长直发'), i18nT('黑长直、棕长直'), 'long straight hair', [[i18nT('黑长直'), 'long straight black hair'], [i18nT('棕长直'), 'long straight brown hair'], [i18nT('挂耳染'), 'long straight hair with hidden colored under-layer']], W),
    h('H02', long, i18nT('大波浪卷发'), i18nT('慵懒、优雅'), 'long big wavy hair', [[i18nT('慵懒大波浪'), 'loose lazy big waves'], [i18nT('侧分优雅波浪'), 'elegant side-parted waves'], [i18nT('好莱坞复古波浪'), 'glamorous Hollywood retro waves']], W),
    h('H03', long, i18nT('微卷长发'), i18nT('空气感'), 'long softly curled airy hair', [[i18nT('空气感微卷'), 'airy soft curls'], [i18nT('锁骨下微卷'), 'soft curls just below the collarbone'], [i18nT('八字刘海微卷'), 'soft curls with curtain bangs']], W),
    h('H06', mid, i18nT('齐肩发'), i18nT('内扣、外翻'), 'shoulder-length hair', [[i18nT('内扣'), 'shoulder-length with ends curled inward'], [i18nT('外翻'), 'shoulder-length with ends flipped out'], [i18nT('锁骨发'), 'collarbone-length lob']], W),
    h('H07', mid, i18nT('波波头'), i18nT('齐下巴、及肩'), 'bob haircut', [[i18nT('齐下巴'), 'chin-length bob'], [i18nT('及肩'), 'shoulder-length bob'], [i18nT('法式刘海波波'), 'French bob with bangs']], W),
    h('H08', mid, i18nT('短直发'), i18nT('精灵短发、碎发'), 'short straight hair', [[i18nT('精灵短发'), 'pixie cut'], [i18nT('层次碎发'), 'layered choppy short hair'], [i18nT('耳下短发'), 'short hair just below the ears']], W),
    h('H09', curl, i18nT('羊毛卷'), i18nT('小卷、蓬松'), 'tight fluffy wool-like curls', [[i18nT('细密小卷'), 'small tight curls'], [i18nT('蓬松大卷'), 'big fluffy curls'], [i18nT('羊毛卷短发'), 'short curly wool perm']], W),
    h('H10', curl, i18nT('复古卷'), i18nT('港风、大卷'), 'retro curls', [[i18nT('港风大卷'), '90s Hong Kong style big curls'], [i18nT('手推波纹'), 'vintage finger waves'], [i18nT('复古卷刘海'), 'retro curled bangs']], W),
    h('H11', curl, i18nT('韩式气垫烫'), i18nT('自然微卷'), 'Korean soft digital perm', [[i18nT('自然微卷'), 'natural soft waves'], [i18nT('C 字内扣卷'), 'C-curl turned inward'], [i18nT('S 字卷'), 'S-shaped waves']], W),
    h('H12', curl, i18nT('法式慵懒卷'), i18nT('随意扎发'), 'French effortless messy curls', [[i18nT('随意低扎'), 'loose low messy bun'], [i18nT('半扎'), 'half-up half-down'], [i18nT('自然披散'), 'worn down, tousled']], W),
    h('H04', tied, i18nT('马尾辫'), i18nT('高马尾、低马尾'), 'ponytail', [[i18nT('高马尾'), 'high ponytail'], [i18nT('低马尾'), 'low ponytail'], [i18nT('蓬松马尾'), 'voluminous ponytail']], WK),
    h('H05', tied, i18nT('麻花辫'), i18nT('单辫、双辫'), 'braids', [[i18nT('单侧麻花辫'), 'single side braid'], [i18nT('双麻花辫'), 'two braids'], [i18nT('鱼骨辫'), 'fishtail braid']], WK),
    h('H13', tied, i18nT('丸子头'), i18nT('高丸子、低丸子'), 'bun hairstyle', [[i18nT('高丸子'), 'high top bun'], [i18nT('低丸子'), 'low bun'], [i18nT('双丸子'), 'double space buns']], WK),
    h('H14', tied, i18nT('盘发'), i18nT('正式、优雅'), 'elegant updo', [[i18nT('低盘发'), 'low chignon'], [i18nT('法式盘发'), 'French twist'], [i18nT('编发盘发'), 'braided formal updo']], W),
    h('H15', tied, i18nT('脏辫'), i18nT('街头、个性'), 'dreadlocks', [[i18nT('满头脏辫'), 'full head of dreadlocks'], [i18nT('半扎脏辫'), 'half-up dreadlocks'], [i18nT('彩色脏辫'), 'colorful dreadlocks']], ALL),
    h('H16', hat, i18nT('发带造型'), i18nT('运动、复古'), 'wearing a headband', [[i18nT('运动发带'), 'sporty headband'], [i18nT('复古宽发带'), 'wide retro headband'], [i18nT('丝巾发带'), 'silk scarf headband']], ALL),
    h('H17', hat, i18nT('棒球帽'), i18nT('休闲'), 'wearing a baseball cap', [[i18nT('正戴'), 'cap worn forward'], [i18nT('反戴'), 'cap worn backwards'], [i18nT('马尾穿帽'), 'ponytail pulled through the cap']], ALL),
    h('H18', hat, i18nT('贝雷帽'), i18nT('法式'), 'wearing a French beret', [[i18nT('侧戴'), 'beret tilted to one side'], [i18nT('正戴'), 'beret worn straight'], [i18nT('贝雷帽配短发'), 'beret with short hair']], W),
    h('H19', hat, i18nT('渔夫帽'), i18nT('防晒、街头'), 'wearing a bucket hat', [[i18nT('纯色'), 'solid color bucket hat'], [i18nT('格纹'), 'plaid bucket hat'], [i18nT('针织'), 'knitted bucket hat']], ALL),
    h('H20', hat, i18nT('无帽／光头'), i18nT('特殊需求'), 'shaved head', [[i18nT('光头'), 'fully shaved head'], [i18nT('极短寸'), 'very short buzz']], ALL),
    h('H21', men, i18nT('男士短碎发'), i18nT('纹理、清爽'), "men's short textured hair", [[i18nT('纹理碎发'), 'textured crop'], [i18nT('美式前刺'), 'American spiky quiff'], [i18nT('韩式逗号刘海'), 'Korean comma-hair fringe']], M),
    h('H22', men, i18nT('背头'), i18nT('商务、利落'), "men's slicked-back hair", [[i18nT('经典背头'), 'classic slicked-back'], [i18nT('侧分油头'), 'side-part pomade'], [i18nT('蓬松背头'), 'voluminous swept-back']], M),
    h('H23', men, i18nT('寸头'), i18nT('干净、硬朗'), "men's buzz cut", [[i18nT('圆寸'), 'round buzz cut'], [i18nT('渐变寸头'), 'fade buzz cut'], [i18nT('板寸'), 'flat-top crew cut']], M),
    h('H24', kids, i18nT('儿童发型'), i18nT('可爱、活泼'), "children's hairstyle", [[i18nT('公主编发'), 'princess braided crown'], [i18nT('羊角辫'), 'two little pigtails'], [i18nT('小男孩西瓜头'), 'boy bowl cut']], K),
  ];
}

export function allStyleOptions(): StyleOptionDef[] {
  return [...backgroundOptions(), ...poseOptions(), ...hairOptions()];
}

/** 给界面 / 手机端用：不带英文画面描述 */
export function publicStyleOptions(): ApStyleOption[] {
  return allStyleOptions().map(({ prompt: _p, variants, ...rest }) => ({ ...rest, variants: variants.map(({ id, label }) => ({ id, label })) }));
}
