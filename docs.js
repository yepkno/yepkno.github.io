// ===== 教学文档数据 =====
// SITE：站点信息（名称、描述、头像路径）
// DOCS：文档列表。新增一篇：复制一个 {...} 对象并修改字段。
//   可选字段 cover："assets/tagpics/xxx.jpg"（该文档专属封面图，最优先）
//   卡片封面取图顺序：文档 cover > 标签照片(TAG_IMAGES) > 默认照片 assets/tag-default.jpg
//   （水彩背景图 assets/bg.jpg 已设为全站页面背景）

window.SITE = {
  name: "叶の个人数据库",
  desc: "个人教学文档与知识整理",
  avatar: "assets/avatar.jpg"
};

// TAG_IMAGES：标签专属照片。
// 配置后：①该标签下的文档卡片用这张图当封面 ②点击/hover 标签时显示这张图。
// 没有专门上传照片的标签，其文档卡片统一用默认照片 assets/tag-default.jpg
window.TAG_IMAGES = {
  // "游戏资源": "assets/tagpics/game.jpg"
};

// MUSIC：右下角悬浮播放器的歌单。
// MUSIC：右下角悬浮播放器的歌单（10 首）。
//       然后在 list 里加一行（url 用文件名的 URL 编码直链）。
// MUSIC：右下角悬浮播放器的歌单（10 首）。
// src 为编码后的音频地址（反转+base64，运行时由 initPlayer 解码），站点与仓库中不出现音频源域名。
// 加歌：本地生成新的编码 src 后在此加一行（操作步骤记录在本地工作日志，勿写入本文件）。
window.MUSIC = {
  list: [
    { name: "Bones", artist: "Low Roar / Jofridur Akadottir", src: "Y2FsZi5zZW5vQjAyJS0wMiVyaXR0b2Rha0EwMiVydWRpcmZvSkMyJXJhb1IwMiV3b0wvcHBhLnlmaWx0ZW4uY2lzdW0tb25rcGV5Ly86c3B0dGg=", cover: "assets/album/01-bones.jpg" },
    { name: "Merry Christmas Mr. Lawrence", artist: "坂本龍一", src: "M3BtLikxKDA4JThCJTRFJUQ4JUVCJTlFJUNBJUM5JTZFJTI4JUQ5JTVFJS0pMDklOUIlNEUlQkElRkIlNUUlRTklRkElOEUlM0ElQzklNUUlRjklNDklN0UlODglNTglNUUlRkElNjklNkUlNkElQ0IlNEUlM0IlQTglNUUlKDAyJWVjbmVyd2FMLnJNMDIlc2FtdHNpcmhDMDIleXJyZU0vcHBhLnlmaWx0ZW4uY2lzdW0tb25rcGV5Ly86c3B0dGg=", cover: "assets/album/02-lawrence.jpg" },
    { name: "起风了", artist: "买辣椒也用券", src: "M3BtLjk4JUNCJUZFJUFBJTQ4JTVFJUI4JTlBJTZFJTg5JUJBJTlFJUIyJXJldm9DODglQ0IlRkUlNjglQUIlNEUlRTglM0ElOUUlN0IlNUIlOEUlQjIlLUIyJThCJTg4JTVFJThBJTQ5JTdFJUY5JTlCJTRFJTI5JTRBJTZFJTNBJUVCJThFJTBCJTlCJTRFJS9wcGEueWZpbHRlbi5jaXN1bS1vbmtwZXkvLzpzcHR0aA==", cover: "assets/album/03-qifengle.jpg" },
    { name: "如果爱忘了", artist: "蓝心羽", src: "M3BtLkRCJUVCJTdFJTM4JUZCJTVFJUQ5JTM5JThFJS02OCVBQiU0RSU4OSVGQiU1RSUxQiU4OCU3RSVDOSVFOSU2RSUyOCU2QSU1RSUvcHBhLnlmaWx0ZW4uY2lzdW0tb25rcGV5Ly86c3B0dGg=", cover: "assets/album/04-aiwangle.jpg" },
    { name: "画心", artist: "张靓颖", src: "M3BtLjM4JUZCJTVFJUJCJTQ5JTdFJUIyJS1CMiU2OSUyQSU5RSUzOSVEOSU5RSUwQSVDQiU1RSUvcHBhLnlmaWx0ZW4uY2lzdW0tb25rcGV5Ly86c3B0dGg=", cover: "assets/album/05-huaxin.jpg" },
    { name: "匆匆那年", artist: "王菲", src: "M3BtLjRCJTlCJTVFJTNBJTI4JTlFJTY4JUM4JTVFJTY4JUM4JTVFJUIyJS1CMiUyQiVGOCU4RSVCOCVFOCU3RSUvcHBhLnlmaWx0ZW4uY2lzdW0tb25rcGV5Ly86c3B0dGg=", cover: "assets/album/06-congcong.jpg" },
    { name: "白鸽", artist: "你的上好佳", src: "M3BtLjNCJURCJTRFJURCJTVBJTVFJUE4JThCJTRFJTQ4JUE5JTdFJTBBJURCJTRFJS1EQiU4QiU5RSVEQiU5OSU3RSUvcHBhLnlmaWx0ZW4uY2lzdW0tb25rcGV5Ly86c3B0dGg=", cover: "assets/album/07-baige.jpg" },
    { name: "茶花开了，该回家了", artist: "王睿卓 / 加木", src: "M3BtLjhBJUM5JTZFJTBBJUE4JTVFJTYyJTM5JUQ4JTVFJUZCJUQ5JTdFJUI4JUU4JTdFJS02OCVBQiU0RSU2QiVFQSU1RSVFOSVCOSU1RSU1QSVGQSU4RSVDOCVDQiVGRSU2OCVBQiU0RSUwOCVDQiU1RSUxQiVBOCU4RSU2QiVDOCU4RSUvcHBhLnlmaWx0ZW4uY2lzdW0tb25rcGV5Ly86c3B0dGg=", cover: "assets/album/08-chahua.jpg" },
    { name: "童话镇", artist: "陈一发", src: "M3BtLjc4JTU5JTlFJUQ5JUZBJThFJTVBJUJBJTdFJS0xOSVGOCU1RSUwOCU4QiU0RSU4OCU5OSU5RSUvcHBhLnlmaWx0ZW4uY2lzdW0tb25rcGV5Ly86c3B0dGg=", cover: "assets/album/09-tonghua.jpg" },
    { name: "富士山下", artist: "陈奕迅", src: "M3BtLkI4JThCJTRFJTFCJTFCJTVFJUJBJTNBJTVFJUM4JUZBJTVFJUIyJS1CMiU1OCVGQiU4RSU1OSU1QSU1RSU4OCU5OSU5RSUvcHBhLnlmaWx0ZW4uY2lzdW0tb25rcGV5Ly86c3B0dGg=", cover: "assets/album/10-fuji.jpg" }
  ]
};

window.DOCS = [

  /* ========================================================================
     旅游攻略 · 滇西北小环线（2026-09-18 从 Word/HTML 上传件整理，已按站点风格重排）
     闭环：大理起、大理止；pts 末位回到大理，地图即成环
     ======================================================================== */
  {
    title: "滇西北小环线 · 5日自驾（重庆出发）",
    category: "旅游攻略",
    region: "云南",
    summary: "重庆出发五日自驾：大理、丽江、香格里拉一路到梅里雪山，看完日照金山原路回大理的环线。",
    date: "2026-10",
    tags: ["自驾", "高原", "环线"],
    cover: "assets/travel/dianxibei/cover.jpg",
    content: `<div class="callout">4 人 1 车 · 5 日核心行程 · <strong>大理起、大理止</strong>的滇西北环线：D0 进云南，D1–D5 走完大理 → 丽江 → 香格里拉 → 梅里雪山，D5 看完日照金山后原路返回大理，D6 返重庆。</div>

<h2 id="tour-overview">先看懂整条路线</h2>
<p>这不是一条追求打卡数量的线路，而是把时间集中给大理、丽江、香格里拉和梅里雪山的 5 日自驾。整条线的节奏是：海风与古城 → 高原峡谷 → 雪山公路 → 日照金山。</p>
<table>
  <tr><th>项目</th><th>内容</th></tr>
  <tr><td class="k">D0</td><td>重庆 → 大理（不计入 5 日旅游，纯赶路）</td></tr>
  <tr><td class="k">D1</td><td>大理古城 → 龙龛码头 → 才村 → 磻溪 S 弯 → 喜洲 → 回大理古城</td></tr>
  <tr><td class="k">D2</td><td>大理 → 黑龙潭 → 丽江古城 → 木府 → 狮子山 → 束河</td></tr>
  <tr><td class="k">D3</td><td>丽江 → 虎跳峡 → 纳帕海 → 松赞林寺 → 香格里拉</td></tr>
  <tr><td class="k">D4</td><td>香格里拉 → 普达措 → 奔子栏 → 金沙江大湾 → 白马雪山沿线 → 德钦 → 雾浓顶 → 飞来寺</td></tr>
  <tr><td class="k">D5</td><td>飞来寺 → 梅里雪山日照金山 → 德钦 → 香格里拉 → 丽江 → 大理</td></tr>
  <tr><td class="k">D6</td><td>大理 → 重庆</td></tr>
</table>
<div class="callout"><strong>关键策略：</strong>D4 一定住飞来寺。D5 清晨只安排梅里雪山观景，结束后全程返程，不再添加景点。4 人默认 2 间双人房。</div>

<h2 id="tour-d0">D0 · 重庆 → 大理｜纯赶路</h2>
<p>D0 不计入 5 日旅游，目标是把车和人送到大理，让 D1 从大理完整开始。<span class="warn">若只有一位驾驶员，不建议为了赶到大理而连续夜间长途驾驶。</span></p>
<table>
  <tr><th>项目</th><th>内容</th></tr>
  <tr><td class="k">出发</td><td>下午从重庆出发</td></tr>
  <tr><td class="k">终点</td><td>大理</td></tr>
  <tr><td class="k">住宿</td><td>城市便捷酒店（大理古城店）</td></tr>
  <tr><td class="k">房费</td><td>约 ¥220–350 / 晚（单间）；4 人 2 间合计约 <strong>¥440–700 / 晚</strong></td></tr>
  <tr><td class="k">备注</td><td>D0 不安排任何景区</td></tr>
</table>
<p>订房用「美团官方入口 + 酒店名称搜索」即可 —— 美团酒店的深层房源链接会随日期与库存变化，写死深链容易失效。</p>

<h2 id="tour-d1">D1 · 大理｜海西 + 喜洲 + 古城</h2>
<p>大理第一天以洱海海西线和喜洲为重点，不追求环洱海完整打卡。</p>
<h3>当日执行表</h3>
<table>
  <tr><th>时间</th><th>小目的地</th><th>停留</th><th>门票</th><th>自驾 / 看点</th></tr>
  <tr><td class="k">08:30–10:00</td><td>大理古城</td><td>1.5h</td><td>免费</td><td>南门 → 人民路 → 五华楼 → 洋人街</td></tr>
  <tr><td class="k">10:15–11:00</td><td>龙龛码头</td><td>45min</td><td>免费</td><td>洱海、水杉、苍山；停车后步行</td></tr>
  <tr><td class="k">11:10–12:00</td><td>才村</td><td>50min</td><td>免费</td><td>海岸、湿地、码头</td></tr>
  <tr><td class="k">12:10–12:50</td><td>磻溪 S 弯</td><td>40min</td><td>免费</td><td>快速拍照；<span class="warn">不要长时间占道停车</span></td></tr>
  <tr><td class="k">13:00–14:00</td><td>午餐</td><td>1h</td><td>—</td><td>建议在喜洲方向解决，避免折返</td></tr>
  <tr><td class="k">14:20–17:00</td><td>喜洲古镇</td><td>2.5–3h</td><td>通常免费</td><td>白族民居、四方街、稻田</td></tr>
  <tr><td class="k">18:30</td><td>回大理古城</td><td>—</td><td>—</td><td>晚餐、散步，继续住大理</td></tr>
</table>
<div class="gal" data-n="4">
    <figure>
      <img src="assets/travel/dianxibei/dali-erhai.jpg" alt="海西线" loading="lazy">
      <figcaption><b>海西线</b>洱海与苍山的开阔视野
        <span class="cr">Brücke-Osteuropa · Public domain · <a href="https://commons.wikimedia.org/wiki/File:Erhai_Lake_Dali_06.JPG" target="_blank" rel="noopener">Commons</a></span>
      </figcaption>
    </figure>
    <figure>
      <img src="assets/travel/dianxibei/dali-oldtown.jpg" alt="大理古城" loading="lazy">
      <figcaption><b>大理古城</b>古城街巷与白族建筑
        <span class="cr">Brücke-Osteuropa · Public domain · <a href="https://commons.wikimedia.org/wiki/File:Dali_Old_Town_05.JPG" target="_blank" rel="noopener">Commons</a></span>
      </figcaption>
    </figure>
    <figure>
      <img src="assets/travel/dianxibei/dali-sbend.jpg" alt="洱海西岸" loading="lazy">
      <figcaption><b>洱海西岸</b>湖畔湿地与远处山影
        <span class="cr">ShuQizhe · <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank" rel="noopener">CC BY-SA 4.0</a> · <a href="https://commons.wikimedia.org/wiki/File:Erhai_20260220-2.jpg" target="_blank" rel="noopener">Commons</a></span>
      </figcaption>
    </figure>
    <figure>
      <img src="assets/travel/dianxibei/dali-xizhou.jpg" alt="喜洲" loading="lazy">
      <figcaption><b>喜洲</b>白族民居与村口稻田
        <span class="cr">Brücke-Osteuropa · Public domain · <a href="https://commons.wikimedia.org/wiki/File:Xizhou_01.JPG" target="_blank" rel="noopener">Commons</a></span>
      </figcaption>
    </figure>
</div>
<h3>费用与停车</h3>
<ul>
  <li>大理古城 ¥0 ｜ 龙龛 / 才村 / S 弯 ¥0 ｜ 喜洲 ¥0（个别院落另计）</li>
  <li>停车预算 ¥10–30 / 天</li>
</ul>
<h3>吃什么</h3>
<p>午餐：喜洲粑粑 + 饵丝 / 米线 + 白族凉菜，约 ¥100–180 / 4 人。</p>
<p>晚餐：<strong>金花小阿妹·白族菜</strong>（大理古城福安巷附近，云南菜、白族家常菜），约 ¥200–320 / 4 人。</p>
<h3>住宿</h3>
<p>城市便捷酒店（大理古城店）｜约 ¥440–700 / 晚（2 间房）· 自驾友好、停车方便，D0 和 D1 可以连续入住。</p>

<h2 id="tour-d2">D2 · 大理 → 丽江｜古城人文日</h2>
<p>把时间放在丽江古城的人文与建筑上，傍晚进入束河。</p>
<h3>当日执行表</h3>
<table>
  <tr><th>时间</th><th>小目的地</th><th>停留</th><th>门票</th><th>自驾 / 看点</th></tr>
  <tr><td class="k">08:30</td><td>大理出发</td><td>—</td><td>—</td><td>预留约 2.5–3h 车程</td></tr>
  <tr><td class="k">11:00–12:00</td><td>黑龙潭</td><td>1h</td><td>维护费范围</td><td>水面、古建筑、玉龙雪山远景</td></tr>
  <tr><td class="k">12:15–13:00</td><td>午餐</td><td>45min</td><td>—</td><td>古城外围 / 附近</td></tr>
  <tr><td class="k">13:00–16:30</td><td>丽江古城 + 木府</td><td>3.5h</td><td>维护费约 ¥50；木府约 ¥40</td><td>大水车 → 四方街 → 木府 → 光义街 → 狮子山</td></tr>
  <tr><td class="k">16:30–17:15</td><td>狮子山</td><td>45min</td><td>免费</td><td>看古城全景；进万古楼另计</td></tr>
  <tr><td class="k">17:30–19:00</td><td>束河古镇</td><td>1.5h</td><td>维护费范围</td><td>青龙桥、九鼎龙潭、古镇街巷</td></tr>
</table>
<div class="gal" data-n="4">
    <figure>
      <img src="assets/travel/dianxibei/lijiang-heilong.jpg" alt="黑龙潭" loading="lazy">
      <figcaption><b>黑龙潭</b>水面、古建与雪山远景
        <span class="cr">CEphoto, Uwe Aranas · <a href="https://creativecommons.org/licenses/by-sa/3.0" target="_blank" rel="noopener">CC BY-SA 3.0</a> · <a href="https://commons.wikimedia.org/wiki/File:Lijiang_Yunnan_Black-Dragon-Pool-01.jpg" target="_blank" rel="noopener">Commons</a></span>
      </figcaption>
    </figure>
    <figure>
      <img src="assets/travel/dianxibei/lijiang-oldtown.jpg" alt="丽江古城" loading="lazy">
      <figcaption><b>丽江古城</b>四方街与古城街巷
        <span class="cr">ChiralJon · <a href="https://creativecommons.org/licenses/by/2.0" target="_blank" rel="noopener">CC BY 2.0</a> · <a href="https://commons.wikimedia.org/wiki/File:Lijiang_Old_Town.jpg" target="_blank" rel="noopener">Commons</a></span>
      </figcaption>
    </figure>
    <figure>
      <img src="assets/travel/dianxibei/lijiang-mufu.jpg" alt="木府" loading="lazy">
      <figcaption><b>木府</b>明代木氏土司府邸正门
        <span class="cr">BrokenSphere · <a href="https://creativecommons.org/licenses/by-sa/3.0" target="_blank" rel="noopener">CC BY-SA 3.0</a> · <a href="https://commons.wikimedia.org/wiki/File:Mu_Mansion_entrance.JPG" target="_blank" rel="noopener">Commons</a></span>
      </figcaption>
    </figure>
    <figure>
      <img src="assets/travel/dianxibei/lijiang-shuhe.jpg" alt="束河" loading="lazy">
      <figcaption><b>束河</b>傍晚更适合慢逛
        <span class="cr">Gisling · <a href="https://creativecommons.org/licenses/by/3.0" target="_blank" rel="noopener">CC BY 3.0</a> · <a href="https://commons.wikimedia.org/wiki/File:%E4%B8%BD%E6%B1%9F%E6%9D%9F%E6%B2%B3%E5%8F%A4%E9%95%87.JPG" target="_blank" rel="noopener">Commons</a></span>
      </figcaption>
    </figure>
</div>
<h3>门票预算</h3>
<ul>
  <li>丽江古城维护费 ¥50 / 人</li>
  <li>木府 约 ¥40 / 人</li>
  <li>万古楼 可选，约 ¥30–35</li>
  <li>本日合计约 <strong>¥90 / 人起</strong></li>
</ul>
<h3>吃什么</h3>
<p>午餐：丽江古城附近简餐，约 ¥120–200 / 4 人。</p>
<p>晚餐：<strong>花花色私房菜</strong>（丽江古城五一街一带，云南地方菜），约 ¥200–320 / 4 人。</p>
<h3>住宿</h3>
<p>丽江晓梦庄精品度假酒店｜约 ¥560–900 / 晚（2 间房）· 束河北门附近，自驾出城方便。</p>

<h2 id="tour-d3">D3 · 丽江 → 虎跳峡 → 纳帕海 → 松赞林寺</h2>
<p>正式进入高原；本日不安排长距离徒步。</p>
<h3>当日执行表</h3>
<table>
  <tr><th>时间</th><th>小目的地</th><th>停留</th><th>门票</th><th>自驾 / 看点</th></tr>
  <tr><td class="k">07:30</td><td>丽江出发</td><td>—</td><td>—</td><td>尽量早点，把虎跳峡留出完整时间</td></tr>
  <tr><td class="k">09:30–12:00</td><td>虎跳峡（上虎跳）</td><td>2–2.5h</td><td>¥45 / 人</td><td>上虎跳观景为主，<span class="warn">不走完整徒步线</span>；中虎跳 / 下虎跳 2026 年起官方禁止进入。<strong>丽江段与香格里拉段门票不通用</strong>，导航请认准「香格里拉虎跳峡游客中心」</td></tr>
  <tr><td class="k">12:00–13:00</td><td>虎跳峡镇午餐</td><td>1h</td><td>—</td><td>牦牛肉、土鸡、米线 / 面</td></tr>
  <tr><td class="k">15:00–16:30</td><td>纳帕海 / 依拉草原</td><td>1.5h</td><td>公共观景 ¥0</td><td>环湖公路、草原、湿地。<span class="warn">注意：它是季节性湖泊——6–8 月才是「水漫草原」，10 月–次年 5 月水退为草甸</span>，别按宣传图预期；骑马要砍价，别跟路边拉客走</td></tr>
  <tr><td class="k">16:30–18:00</td><td>松赞林寺</td><td>1.5h</td><td>约 ¥55–90 / 人（含讲解）</td><td>云南规模最大的藏传佛教格鲁派寺院，「小布达拉宫」；距市区约 5 km，黄昏光线最好</td></tr>
</table>
<div class="gal" data-n="3">
    <figure>
      <img src="assets/travel/dianxibei/tiger-gorge.jpg" alt="虎跳峡" loading="lazy">
      <figcaption><b>虎跳峡</b>峡谷与金沙江
        <span class="cr">CEphoto, Uwe Aranas · <a href="https://creativecommons.org/licenses/by-sa/3.0" target="_blank" rel="noopener">CC BY-SA 3.0</a> · <a href="https://commons.wikimedia.org/wiki/File:Yunnan_China_Tiger-Leaping-Gorge-07.jpg" target="_blank" rel="noopener">Commons</a></span>
      </figcaption>
    </figure>
    <figure>
      <img src="assets/travel/dianxibei/shangri-napa.jpg" alt="纳帕海" loading="lazy">
      <figcaption><b>纳帕海</b>草原、湿地与高原天空
        <span class="cr">Zhongguotravel · <a href="https://creativecommons.org/licenses/by-sa/3.0" target="_blank" rel="noopener">CC BY-SA 3.0</a> · <a href="https://commons.wikimedia.org/wiki/File:Napa_Lake.jpg" target="_blank" rel="noopener">Commons</a></span>
      </figcaption>
    </figure>
    <figure>
      <img src="assets/travel/dianxibei/shangri-songzanlin.jpg" alt="松赞林寺" loading="lazy">
      <figcaption><b>松赞林寺</b>云南最大藏传佛寺，「小布达拉宫」
        <span class="cr">BrokenSphere · <a href="https://creativecommons.org/licenses/by-sa/3.0" target="_blank" rel="noopener">CC BY-SA 3.0</a> · <a href="https://commons.wikimedia.org/wiki/File:Songzanlin_Monastery_front.JPG" target="_blank" rel="noopener">Commons</a></span>
      </figcaption>
    </figure>
</div>
<h3>门票预算</h3>
<ul>
  <li>虎跳峡（上虎跳）¥45 / 人 ｜ 纳帕海公共观景 ¥0 ｜ 松赞林寺 约 ¥55–90 / 人（含讲解）</li>
  <li>虎跳峡观光电梯、纳帕海骑马等项目为自愿消费，本攻略不纳入预算</li>
</ul>
<h3>吃什么</h3>
<p>午餐：虎跳峡镇简餐，以快、热量够为主，约 ¥120–200 / 4 人。</p>
<p>晚餐：<strong>瞻巴拉藏餐吧</strong>（香格里拉市区，可尝牦牛肉、藏式面食、酥油茶），约 ¥200–360 / 4 人。</p>
<h3>住宿</h3>
<p>麗枫酒店（香格里拉店）｜约 ¥500–800 / 晚（2 间房）· 入住时确认停车、供暖、制氧条件。</p>

<h2 id="tour-d4">D4 · 香格里拉 → 普达措 → 奔子栏 → 飞来寺</h2>
<p>上午先补上香格里拉最精华的普达措，中午出发走景观公路去飞来寺。真正重要的不是打卡数量，而是沿途的山谷、峡谷和雪山。</p>
<h3>当日执行表</h3>
<table>
  <tr><th>时间</th><th>小目的地</th><th>停留</th><th>门票</th><th>自驾 / 看点</th></tr>
  <tr><td class="k">07:30–08:00</td><td>出发去普达措</td><td>—</td><td>—</td><td>市区往东约 22 km；早点进园人少</td></tr>
  <tr><td class="k">08:00–11:00</td><td>普达措国家公园</td><td>3h</td><td>¥138 / 人（含观光车）</td><td>属都湖栈道 + 碧塔海；<strong>10 月正是层林尽染的时候</strong></td></tr>
  <tr><td class="k">11:00–12:30</td><td>出发去奔子栏</td><td>—</td><td>—</td><td>约 100 km</td></tr>
  <tr><td class="k">12:30–13:30</td><td>奔子栏午餐</td><td>1h</td><td>免费</td><td>休息、补给、拍照</td></tr>
  <tr><td class="k">13:45–14:30</td><td>金沙江大湾 / 月亮湾</td><td>30–45min</td><td>梅里套票范围</td><td>观景台单买约 ¥20–60；含在梅里组合票内</td></tr>
  <tr><td class="k">14:45–16:15</td><td>白马雪山沿线</td><td>1–1.5h</td><td>公共安全观景点免费</td><td>把「路」当景点，<span class="warn">只在正规安全停车点停留</span></td></tr>
  <tr><td class="k">16:30–17:15</td><td>德钦</td><td>45min</td><td>—</td><td>加油 + 买水 + 检查车辆</td></tr>
  <tr><td class="k">17:45–18:30</td><td>雾浓顶</td><td>45min</td><td>梅里套票范围</td><td>正式进入梅里核心观景区；若时间紧张可改为路过不停留</td></tr>
  <tr><td class="k">19:00</td><td>飞来寺</td><td>—</td><td>梅里套票范围</td><td>入住 → 看夕阳 → 吃饭 → 尽早睡觉</td></tr>
</table>
<div class="gal" data-n="3">
    <figure>
      <img src="assets/travel/dianxibei/deqin-bend.jpg" alt="金沙江大湾" loading="lazy">
      <figcaption><b>金沙江大湾</b>月亮湾与公路观景位
        <span class="cr">Smwy09 · <a href="https://creativecommons.org/licenses/by-sa/3.0" target="_blank" rel="noopener">CC BY-SA 3.0</a> · <a href="https://commons.wikimedia.org/wiki/File:%E4%BA%91%E5%8D%97%EF%BC%8C%E6%9C%88%E4%BA%AE%E6%B9%BE.jpg" target="_blank" rel="noopener">Commons</a></span>
      </figcaption>
    </figure>
    <figure>
      <img src="assets/travel/dianxibei/meili-panorama.jpg" alt="梅里雪山" loading="lazy">
      <figcaption><b>梅里雪山</b>飞来寺观景台方向的全景
        <span class="cr">Kevin Poh · <a href="https://creativecommons.org/licenses/by/2.0" target="_blank" rel="noopener">CC BY 2.0</a> · <a href="https://commons.wikimedia.org/wiki/File:Meili_Snow_Mountain,_Deqin_County,_Yunnan.jpg" target="_blank" rel="noopener">Commons</a></span>
      </figcaption>
    </figure>
    <figure>
      <img src="assets/travel/dianxibei/shangri-pudacuo.jpg" alt="普达措" loading="lazy">
      <figcaption><b>普达措</b>弥里塘牧场；10 月正是层林尽染、草甸金黄的时候
        <span class="cr">Colin W · <a href="https://creativecommons.org/licenses/by-sa/3.0" target="_blank" rel="noopener">CC BY-SA 3.0</a> · <a href="https://commons.wikimedia.org/wiki/File:Militang_Pasture,_Potatso_(Pudacuo)_National_Park,_Diqing_-_panoramio.jpg" target="_blank" rel="noopener">Commons</a></span>
      </figcaption>
    </figure>
</div>
<h3>门票预算</h3>
<ul>
  <li>普达措国家公园 <strong>¥138 / 人</strong>（含景区观光车；属都湖游船约 ¥65 自愿）</li>
  <li>梅里雪山组合票：当前口径约 <strong>¥150 / 人</strong>，组合内容为金沙江大湾 + 雾浓顶 + 飞来寺观景台</li>
  <li><strong>如果住飞来寺的雪山观景房，其实可以不用买飞来寺观景台门票</strong>——酒店房间和天台就正对卡瓦格博</li>
  <li>旧政府单点定价与当前平台组合票口径并不完全相同，<span class="warn">出发前以正规售票渠道为准</span></li>
</ul>
<h3>吃什么</h3>
<p>午餐：德钦县城家常菜，简餐为主，重点是补给和休息，约 ¥120–200 / 4 人。</p>
<p>晚餐：<strong>梅里往事</strong>（飞来寺 / 德钦方向备选），山里营业状态以当天为准，约 ¥200–360 / 4 人。</p>
<h3>住宿</h3>
<p>飞来寺明珠酒店类雪山观景房｜约 ¥700–1,400 / 晚（2 间房）· <span class="warn">务必选择「雪山正面观景房」</span>。</p>
<p>4 人住宿默认 2 间双人房，D0–D5 共 6 晚；若选择家庭房 / 四人套房，实际住宿费用可能更低。</p>

<h2 id="tour-d5">D5 · 梅里雪山日照金山 → 大理</h2>
<p>早晨看雪山，之后整天用于长途返程。</p>
<h3>当日执行表</h3>
<table>
  <tr><th>时间</th><th>小目的地</th><th>停留</th><th>门票</th><th>自驾 / 看点</th></tr>
  <tr><td class="k">05:30 左右</td><td>起床</td><td>—</td><td>—</td><td>按当天日出调整，目标是日出前 30–60 分钟到位</td></tr>
  <tr><td class="k">06:00–08:00</td><td>梅里雪山 · 日照金山</td><td>1.5–2h</td><td>已计入梅里预算</td><td>不爬山、不去雨崩，只在飞来寺观景区看卡瓦格博</td></tr>
  <tr><td class="k">08:00–08:30</td><td>早餐 + 退房</td><td>30min</td><td>—</td><td>早餐后立即退房，不再加拍摄点</td></tr>
  <tr><td class="k">08:30–下午</td><td>长途返程</td><td>—</td><td>—</td><td>飞来寺 → 德钦 → 奔子栏 → 香格里拉 → 丽江 → 大理；<strong>约 490 km，纯驾驶 7–8 小时</strong></td></tr>
  <tr><td class="k">21:00–22:00</td><td>回到大理</td><td>—</td><td>—</td><td>5 日计划在此闭环；到达后直接休息</td></tr>
</table>
<div class="gal" data-n="1">
    <figure>
      <img src="assets/travel/dianxibei/meili-kawagebo.jpg" alt="卡瓦格博峰" loading="lazy">
      <figcaption><b>卡瓦格博峰</b>梅里主峰；日照金山要看天气，不是保证项目
        <span class="cr">瑞丽江的河水 · <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank" rel="noopener">CC BY-SA 4.0</a> · <a href="https://commons.wikimedia.org/wiki/File:%E5%8D%A1%E7%93%A6%E6%A0%BC%E5%8D%9A%E5%B3%B0_-_2025-05-10_IMG_3511.jpg" target="_blank" rel="noopener">Commons</a></span>
      </figcaption>
    </figure>
</div>
<div class="callout"><strong>日照金山不是保证项目。</strong>云量和能见度决定实际观赏效果；若遇降雪、浓雾、落石或道路管制，应服从当地道路与安全信息，不为赶时间强行驾驶。</div>
<h3>吃什么</h3>
<p>午餐：奔子栏 / 香格里拉沿线简餐，约 ¥120–180 / 4 人，重点是快速补给。</p>
<p>回大理晚餐：<strong>云禾壹海景庄园餐厅</strong>（若抵达较早，大理古城南门附近），约 ¥360–500 / 4 人；太晚就近解决。</p>
<h3>住宿</h3>
<p>城市便捷酒店（大理古城店）｜约 ¥440–700 / 晚（2 间房）· 回程后不再折腾换酒店。</p>

<h2 id="tour-budget">4 人 1 车 · 全程预算</h2>
<p>预算口径：4 人、1 台 5 座租车、日均租车约 ¥150、6–7 天租期、通常 2 间双人房；国庆免费时段的高速通行费按 ¥0 计。</p>
<div class="callout"><strong>合计约 ¥12,700–18,700（4 人总额）</strong>，人均约 ¥3,200–4,700。不含购物、骑马、游船、氧气、防寒服、保险及意外延误住宿。<br>其中租车按「5 座 SUV + 提前一周订」的实际行情重算，是相比早期估算变动最大的一项。</div>
<table>
  <tr><th>项目</th><th>预算</th><th>说明</th></tr>
  <tr><td class="k">住宿</td><td>¥3,080–5,200</td><td>D0–D5 共 6 晚，通常 2 间房；<span class="warn">国庆旺季普遍上浮 30–50%，建议按上限准备</span></td></tr>
  <tr><td class="k">门票</td><td>¥1,912–2,192</td><td>4 人合计，含黑龙潭维护费、木府、万古楼、虎跳峡、<strong>普达措</strong>、<strong>松赞林寺</strong>、梅里组合票</td></tr>
  <tr><td class="k">餐饮</td><td>¥2,800–3,600</td><td>4 人普通云南餐饮</td></tr>
  <tr><td class="k">油费</td><td>¥2,000–2,400</td><td>约 3,300–3,500 公里；云南油价约 7.5–8 元 / 升</td></tr>
  <tr><td class="k">租车</td><td>¥2,700–4,900</td><td>5 座 SUV、<strong>提前一周订</strong>的实际行情 ¥450–700 / 天 × 6–7 天；属交通，不计入门票</td></tr>
  <tr><td class="k">高速</td><td>¥0</td><td>按 2026 国庆免费政策预算</td></tr>
  <tr><td class="k">停车</td><td>¥200–400</td><td>视景区 / 酒店而变（虎跳峡停车 5 元 / 次等）</td></tr>
</table>
<h3>门票明细</h3>
<table>
  <tr><th>项目</th><th>预算 / 人</th><th>备注</th></tr>
  <tr><td class="k">黑龙潭（含古城维护费）</td><td>¥50</td><td><strong>散客进丽江古城本身免费</strong>，只有进黑龙潭需缴维护费（跟团才强制收）</td></tr>
  <tr><td class="k">木府</td><td>约 ¥40</td><td>含免费官方讲解；夜场票另约 ¥98</td></tr>
  <tr><td class="k">万古楼</td><td>约 ¥30–35</td><td>狮子山本身免费；可选</td></tr>
  <tr><td class="k">虎跳峡（上虎跳）</td><td>¥45</td><td>60–69 岁 / 学生半价；观光电梯往返约 ¥80 自愿</td></tr>
  <tr><td class="k">普达措国家公园</td><td>¥138</td><td>含景区观光车</td></tr>
  <tr><td class="k">松赞林寺</td><td>约 ¥55–90</td><td>含讲解与往返观光车</td></tr>
  <tr><td class="k">梅里雪山组合票</td><td>约 ¥150</td><td>含金沙江大湾 + 雾浓顶 + 飞来寺；住观景房可不买飞来寺观景台部分</td></tr>
  <tr><td class="k">合计</td><td><strong>约 ¥478–548</strong></td><td>4 人合计约 ¥1,912–2,192</td></tr>
</table>
<h3>国庆高速免费怎么算</h3>
<p>2026 年 10 月 1 日 0:00 至 10 月 7 日 24:00，7 座及以下小型客车免收通行费；<strong>是否免费按车辆驶离高速出口收费站的时间判断</strong>。若 D0 为 9 月 30 日下午出发，只要在 10 月 1 日 0:00 后驶离出口、且车辆符合条件，该段即可按 ¥0 预算；反之在 9 月 30 日 23:59 前驶离，则可能正常收费。</p>

<h2 id="tour-rent">租车怎么订最划算</h2>
<p>这段路要翻白马雪山、走高原山路，租车是整个预算里最容易算错、也最该提前动手的一项。</p>
<div class="callout"><strong>先说结论：一定要选「不限里程」套餐。</strong>这条线路（重庆往返 + 云南环线）约 3,300–3,500 公里，摊到 6–7 天就是<strong>每天 470–580 公里</strong>；而标准套餐通常限 <strong>200 公里 / 天</strong>，超里程按 <strong>1–2 元 / 公里</strong>另收 —— 算下来可能多花上千元。不限里程套餐一般只贵约 50 元 / 天，很值。</div>
<table>
  <tr><th>项目</th><th>行情</th><th>说明</th></tr>
  <tr><td class="k">车型</td><td>5 座 SUV</td><td>山路 + 高原，轿车通过性差；不必上硬派越野</td></tr>
  <tr><td class="k">租金（淡季）</td><td>¥200–350 / 天</td><td>SUV 平日价</td></tr>
  <tr><td class="k">租金（国庆）</td><td><strong>¥450–700 / 天</strong></td><td>节假日热门城市热门车型上涨 50–100%</td></tr>
  <tr><td class="k">提前多久订</td><td>越早越好</td><td>提前 30 天比节前一周<strong>便宜约一半</strong>；最佳窗口是提前 30–45 天（直营平台 8 月中旬就开放国庆预订）</td></tr>
  <tr><td class="k">取车时间</td><td>9 月 30 日</td><td><strong>9/30 取车通常比 10/1 便宜 30% 以上</strong>，正好对上 D0 下午出发</td></tr>
  <tr><td class="k">押金</td><td>¥3,000–5,000</td><td>信用卡预授权，还车后 15–30 天解冻；多数平台支持信用免押</td></tr>
  <tr><td class="k">超公里费</td><td>¥1–2 / 公里</td><td>选不限里程套餐可完全规避</td></tr>
  <tr><td class="k">异地还车费</td><td>约 ¥1 / 公里</td><td>本行程同城取还，不涉及</td></tr>
  <tr><td class="k">保险</td><td>¥50–80 / 天</td><td>不计免赔升级；基础险通常有 1,500 元免赔额，山路建议买</td></tr>
</table>
<p><strong>下单前务必确认</strong>：套餐是否限里程、保险覆盖范围、超时收费标准（多数平台超时 1 小时按日租金的 20%–50% 计）。取车时绕车拍完整视频留证，别只认口头承诺。</p>
<p>另外：<strong>市区门店取车通常比机场 / 高铁站便宜</strong>；很多平台支持免费取消，行程没完全定也可以先下单锁价，之后再改。</p>

<h2 id="tour-tips">自驾出发前最后检查</h2>
<p>这条线路真正需要重视的不是「能不能打卡」，而是高原山路与第五天长途返程的安全裕度。</p>
<table>
  <tr><th>重点</th><th>执行建议</th></tr>
  <tr><td class="k">驾驶</td><td>建议两人轮换，D4、D5 尤其避免疲劳驾驶</td></tr>
  <tr><td class="k">租车</td><td>提前订、选不限里程套餐；取车时拍视频留证</td></tr>
  <tr><td class="k">门票</td><td>丽江古城散客免费，只有黑龙潭需缴维护费；束河古镇免费</td></tr>
  <tr><td class="k">天气</td><td>出发前和当天早晨都看香格里拉、德钦的道路与天气</td></tr>
  <tr><td class="k">补给</td><td>D4 在德钦完成加油、饮水、食物和车辆检查</td></tr>
  <tr><td class="k">停车</td><td>海西生态廊道等区域不要把社会车辆开入禁止机动车路段</td></tr>
  <tr><td class="k">高原</td><td>秋季山区早晚温差大，飞来寺清晨观景准备保暖层</td></tr>
  <tr><td class="k">梅里</td><td>日照金山不是保证项目，云量与能见度决定实际效果</td></tr>
  <tr><td class="k">D5</td><td>看完日照金山后不再增加景点，纯返程回大理</td></tr>
</table>
<div class="callout"><strong>行程核心：</strong>D1 把时间给大理；D2 给丽江；D3 进入香格里拉；D4 抵达飞来寺；D5 用最早的时间换取一次梅里雪山日照金山机会，然后安全回到大理。</div>

<h2 id="tour-credits">风景照片来源</h2>
<p>本页风景照片来自 <strong>Wikimedia Commons</strong>，均按其许可协议使用并标注作者与许可。照片为行程视觉参考，不代表实时景观；页面图片已本地化存放，不依赖任何外部图床。</p>
<table>
  <tr><th>地点</th><th>作者</th><th>许可</th></tr>
    <tr><td class="k">海西线</td><td>Brücke-Osteuropa</td><td>Public domain</td></tr>
  <tr><td class="k">大理古城</td><td>Brücke-Osteuropa</td><td>Public domain</td></tr>
  <tr><td class="k">洱海西岸</td><td>ShuQizhe</td><td>CC BY-SA 4.0</td></tr>
  <tr><td class="k">喜洲</td><td>Brücke-Osteuropa</td><td>Public domain</td></tr>
  <tr><td class="k">黑龙潭</td><td>CEphoto, Uwe Aranas</td><td>CC BY-SA 3.0</td></tr>
  <tr><td class="k">丽江古城</td><td>ChiralJon</td><td>CC BY 2.0</td></tr>
  <tr><td class="k">木府</td><td>BrokenSphere</td><td>CC BY-SA 3.0</td></tr>
  <tr><td class="k">束河</td><td>Gisling</td><td>CC BY 3.0</td></tr>
  <tr><td class="k">虎跳峡</td><td>CEphoto, Uwe Aranas</td><td>CC BY-SA 3.0</td></tr>
  <tr><td class="k">纳帕海</td><td>Zhongguotravel</td><td>CC BY-SA 3.0</td></tr>
  <tr><td class="k">松赞林寺</td><td>BrokenSphere</td><td>CC BY-SA 3.0</td></tr>
  <tr><td class="k">普达措</td><td>Colin W</td><td>CC BY-SA 3.0</td></tr>
  <tr><td class="k">金沙江大湾</td><td>Smwy09</td><td>CC BY-SA 3.0</td></tr>
  <tr><td class="k">梅里雪山</td><td>Kevin Poh</td><td>CC BY 2.0</td></tr>
  <tr><td class="k">卡瓦格博峰</td><td>瑞丽江的河水</td><td>CC BY-SA 4.0</td></tr>
</table>
<p>除上述照片外，本页文字内容为站长整理，仅作个人行程参考；酒店价格、餐厅营业状态、景区票价、道路通行与天气均应以出发时的实时信息为准。</p>
`,
    pts: [
      { d: 1, n: "大理", lon: 100.23, lat: 25.59, stay: "大理", pv: "530000" },
      { d: 2, n: "丽江", lon: 100.23, lat: 26.86, stay: "丽江", pv: "530000" },
      { d: 3, n: "虎跳峡", lon: 100.11, lat: 27.19, stay: null, pv: "530000" },
      { d: 3, n: "香格里拉", lon: 99.71, lat: 27.83, stay: "香格里拉", pv: "530000" },
      { d: 4, n: "奔子栏", lon: 99.30, lat: 28.24, stay: null, pv: "530000" },
      { d: 4, n: "飞来寺", lon: 98.88, lat: 28.48, stay: "飞来寺", pv: "530000" },
      { d: 5, n: "大理", lon: 100.23, lat: 25.59, stay: "大理", pv: "530000", back: 1 }
    ],
    people: 4,
    cost: { "住宿": 4140, "门票": 2050, "餐饮": 3200, "油费": 2200, "租车": 3800, "停车": 300 },
    plan: [
      ["D1", "大理 · 海西 + 喜洲 + 古城", "大理", "80"],
      ["D2", "大理 → 丽江", "丽江", "180"],
      ["D3", "丽江 → 虎跳峡 → 纳帕海 → 松赞林寺", "香格里拉", "220"],
      ["D4", "香格里拉 → 普达措 → 奔子栏 → 飞来寺", "飞来寺", "225"],
      ["D5", "飞来寺 → 大理（原路返程）", "大理", "490"]
    ],
    days: [
      { d: 1, spots: [
        { city: "大理", list: ["大理古城", "龙龛码头", "才村", "磻溪S弯", "喜洲古镇"] }
      ]},
      { d: 2, spots: [
        { city: "丽江", list: ["黑龙潭", "丽江古城", "木府", "狮子山", "束河古镇"] }
      ]},
      { d: 3, spots: [
        { city: "香格里拉", list: ["虎跳峡", "纳帕海 / 依拉草原", "松赞林寺"] }
      ]},
      { d: 4, spots: [
        { city: "德钦", list: ["普达措国家公园", "金沙江大湾", "白马雪山沿线", "雾浓顶", "飞来寺"] }
      ]},
      { d: 5, spots: [
        { city: "大理", list: ["梅里雪山日照金山", "长途返程 490 km"] }
      ]}
    ]
  },


  /* ========================================================================
     旅游攻略（新版结构：首页 3D 环 → 点开三卡「正文 / 行程地图 / 数据报表」）
     扩展字段说明：
       region  标准地区名，须与 11 双向管理文件\地区词表.xlsx 的「标准地区名」一致
       pts     逐日行程点：[{d:第几天, n:地名, lon:经度, lat:纬度, stay:当晚住宿(无则 null)}]
                （back:1 表示"到这一点的这一段是原路返程"，地图上画成虚线）
       cost    费用构成：{ 类别: 金额 }（元）
       people  这份 cost 对应的**人数**（数据报表据此算人均；不写按 2 人算）
       plan    逐日行程表：[["D1","路线","住宿","里程km"], ...]（跨两天可写 "D5-D6"）
       days    逐日「城市 + 景点」，行程地图右侧的 DAY 按钮点开后展示：
               [{d:第几天, spots:[{city:"城市名", list:["景点1","景点2"]}, ...]}, ...]
               ⚠️ d 必须写**实际第几天**：plan 里写成 "D5-D6" 的，这里要拆成 d:5、d:6 两条。
     注：以下 3 篇（川西 / 西北大环线 / 云南）为**框架示例数据**，正式内容待录入后替换。
     ======================================================================== */
  {
    title: "川西环线 · 稻城亚丁",
    category: "旅游攻略",
    region: "川西",
    summary: "成都出发四天，翻折多山、进亚丁沟、收在丹巴藏寨。",
    date: "2024-04",
    tags: ["自驾", "高原"],
    cover: "assets/travel/chuanxi.jpg",
    content: `
      <p>四月的川西，雪线还没退。从成都出发那天正好下雨，出都江堰后云散了，一路到康定都是新绿。</p>
      <p>折多山是第一个关口，海拔 4298 米，风大得站不稳。翻过去之后，山的那边完全是另一种天气——干、亮、蓝得发狠。</p>
      <p>亚丁村住了一晚，第二天一早进沟。仙乃日、央迈勇、夏诺多吉三座神山，一天看全要靠运气，我们赶上了。</p>
      <p>最后一站丹巴，藏寨沿着山坡堆上去，傍晚的光打在石墙上，整片山坡是暖的。</p>
    `,
    pts: [
      { d: 1, n: "成都", lon: 104.07, lat: 30.67, stay: "成都", pv: "510000" },
      { d: 2, n: "康定", lon: 101.96, lat: 30.05, stay: null, pv: "510000" },
      { d: 2, n: "折多山", lon: 101.80, lat: 30.05, stay: "新都桥", pv: "510000" },
      { d: 3, n: "稻城亚丁", lon: 100.30, lat: 28.43, stay: "亚丁村", pv: "510000" },
      { d: 4, n: "丹巴", lon: 101.89, lat: 30.88, stay: "丹巴", pv: "510000" }
    ],
    people: 2,
    cost: { "交通": 620, "住宿": 480, "餐饮": 320, "门票": 380, "其他": 100 },
    plan: [
      ["D1", "成都 → 康定", "成都", "280"],
      ["D2", "康定 → 新都桥", "新都桥", "190"],
      ["D3", "新都桥 → 稻城亚丁", "亚丁村", "420"],
      ["D4", "亚丁 → 丹巴", "丹巴", "530"]
    ],
    days: [
      { d: 1, spots: [
        { city: "成都", list: ["宽窄巷子", "锦里古街"] },
        { city: "泸定", list: ["泸定桥"] }
      ]},
      { d: 2, spots: [
        { city: "康定", list: ["木格措", "跑马山"] },
        { city: "新都桥", list: ["折多山口", "十里长廊"] }
      ]},
      { d: 3, spots: [
        { city: "理塘", list: ["理塘寺", "毛垭大草原"] },
        { city: "稻城", list: ["稻城白塔", "亚丁三神山"] }
      ]},
      { d: 4, spots: [
        { city: "稻城", list: ["珍珠海", "洛绒牛场"] },
        { city: "丹巴", list: ["甲居藏寨", "中路藏寨"] }
      ]}
    ]
  },
  {
    title: "西北大环线",
    category: "旅游攻略",
    region: "西北",
    summary: "西宁出发七天，青海湖、茶卡、大柴旦一路到敦煌。",
    date: "2023-09",
    tags: ["自驾", "戈壁"],
    cover: "assets/travel/xibei.jpg",
    content: `
      <p>九月的西北是最好的季节。西宁出发那天晴，青海湖蓝得不像话。</p>
      <p>茶卡的人比想象中多，真正好看的是往德令哈的路上那一段无人区。</p>
      <p>大柴旦的翡翠湖是意外之喜，比茶卡干净得多，也没什么人。</p>
      <p>最后到敦煌，莫高窟的票要提前一个月抢，没抢到就看了鸣沙山，日落时整片沙丘是金的。</p>
    `,
    pts: [
      { d: 1, n: "西宁", lon: 101.78, lat: 36.62, stay: "西宁", pv: "630000" },
      { d: 2, n: "青海湖", lon: 100.20, lat: 36.90, stay: "黑马河", pv: "630000" },
      { d: 3, n: "茶卡盐湖", lon: 99.08, lat: 36.78, stay: "德令哈", pv: "630000" },
      { d: 4, n: "大柴旦", lon: 95.30, lat: 37.85, stay: "大柴旦", pv: "630000" },
      { d: 6, n: "敦煌", lon: 94.66, lat: 40.14, stay: "敦煌", pv: "620000" }
    ],
    people: 2,
    cost: { "交通": 1240, "住宿": 860, "餐饮": 520, "门票": 420, "其他": 160 },
    plan: [
      ["D1", "抵达西宁", "西宁", "0"],
      ["D2", "西宁 → 青海湖", "黑马河", "220"],
      ["D3", "青海湖 → 茶卡", "德令哈", "380"],
      ["D4", "德令哈 → 大柴旦", "大柴旦", "340"],
      ["D5-D6", "大柴旦 → 敦煌", "敦煌", "620"],
      ["D7", "敦煌返程", "—", "—"]
    ],
    days: [
      { d: 1, spots: [
        { city: "西宁", list: ["塔尔寺", "莫家街"] }
      ]},
      { d: 2, spots: [
        { city: "湟源", list: ["日月山"] },
        { city: "共和", list: ["青海湖二郎剑", "黑马河日出"] }
      ]},
      { d: 3, spots: [
        { city: "乌兰", list: ["茶卡盐湖"] },
        { city: "德令哈", list: ["可鲁克湖", "外星人遗址"] }
      ]},
      { d: 4, spots: [
        { city: "大柴旦", list: ["翡翠湖", "南八仙雅丹"] }
      ]},
      { d: 5, spots: [
        { city: "大柴旦", list: ["水上雅丹", "西台吉乃尔湖"] }
      ]},
      { d: 6, spots: [
        { city: "敦煌", list: ["鸣沙山月牙泉", "莫高窟"] }
      ]},
      { d: 7, spots: [
        { city: "敦煌", list: ["玉门关", "雅丹魔鬼城", "沙洲夜市"] }
      ]}
    ]
  },
  {
    title: "云南 · 大理到泸沽湖",
    category: "旅游攻略",
    region: "云南",
    summary: "九天慢走昆明、大理、沙溪、丽江，收在泸沽湖。",
    date: "2022-08",
    tags: ["自由行", "古镇"],
    cover: "assets/travel/yunnan.jpg",
    content: `
      <p>八月的云南是雨季，一路都在等雨停。</p>
      <p>大理住了三天，什么都不干，就在洱海边骑车。</p>
      <p>沙溪是整趟最喜欢的地方，寺登街的老戏台还在，晚上没什么灯。</p>
      <p>泸沽湖的水很清楚，划猪槽船出去，能看到水底的草。</p>
    `,
    pts: [
      { d: 1, n: "昆明", lon: 102.83, lat: 24.88, stay: "昆明", pv: "530000" },
      { d: 3, n: "大理", lon: 100.23, lat: 25.59, stay: "大理", pv: "530000" },
      { d: 5, n: "沙溪", lon: 99.85, lat: 26.32, stay: "沙溪", pv: "530000" },
      { d: 7, n: "丽江", lon: 100.23, lat: 26.86, stay: "丽江", pv: "530000" },
      { d: 9, n: "泸沽湖", lon: 100.78, lat: 27.70, stay: "泸沽湖", pv: "530000" }
    ],
    people: 2,
    cost: { "交通": 980, "住宿": 640, "餐饮": 420, "门票": 260, "其他": 100 },
    plan: [
      ["D1-D2", "昆明", "昆明", "0"],
      ["D3-D4", "昆明 → 大理", "大理", "330"],
      ["D5-D6", "大理 → 沙溪", "沙溪", "180"],
      ["D7-D8", "沙溪 → 丽江", "丽江", "160"],
      ["D9", "丽江 → 泸沽湖", "泸沽湖", "210"]
    ],
    days: [
      { d: 1, spots: [
        { city: "昆明", list: ["滇池", "翠湖公园"] }
      ]},
      { d: 2, spots: [
        { city: "昆明", list: ["石林", "云南大学老校区"] }
      ]},
      { d: 3, spots: [
        { city: "大理", list: ["大理古城", "洱海生态廊道"] }
      ]},
      { d: 4, spots: [
        { city: "大理", list: ["喜洲古镇", "苍山感通索道"] }
      ]},
      { d: 5, spots: [
        { city: "剑川", list: ["沙溪寺登街", "老戏台"] }
      ]},
      { d: 6, spots: [
        { city: "剑川", list: ["石宝山", "茶马古道遗址"] }
      ]},
      { d: 7, spots: [
        { city: "丽江", list: ["丽江古城", "束河古镇"] }
      ]},
      { d: 8, spots: [
        { city: "丽江", list: ["玉龙雪山", "拉市海"] }
      ]},
      { d: 9, spots: [
        { city: "宁蒗", list: ["泸沽湖里格半岛", "走婚桥"] }
      ]}
    ]
  },
  {
    title: "ArcGIS 10.8.2 安装教程与资源下载",
    category: "软件资源",
    summary: "ArcGIS Desktop 10.8.2 安装教程（破解+汉化全流程文字版），附说明文档原件下载。",
    date: "2026-09-16",
    tags: ["ArcGIS", "GIS"],
    cover: "assets/tagpics/arcgis-card.jpg?v=20260917",
    content: `
      <div class="callout">📌 本教程整理自网络资源（GIS思维），包含 <strong>主程序安装 + 破解激活 + 汉化</strong> 全流程，仅供个人学习交流使用，如有侵权请联系删除。</div>
      <hr>
      <h2>一、软件简介</h2>
      <p>ArcGIS Desktop 10.8.2 全套资源，包含 ArcMap、ArcCatalog、ArcToolbox 等核心组件，支持 Editing、Layout、Geodatabase、Spatial Analysis、Topology、Network 等功能。</p>
      <p>下载解压后的文件包含三部分：</p>
      <ul>
        <li><code>Setup</code> —— 主程序安装包（<code>ArcGIS_Desktop_1082_180378.exe</code>）</li>
        <li><code>Crack</code> —— 破解文件（<code>Afcore.dll</code>）</li>
        <li><code>汉化包</code> —— 中文语言包（<code>ArcGIS_DesktopLP_chs_1082_180381.exe</code>）</li>
      </ul>
      <hr>
      <h2>二、安装教程</h2>
      <h3>第 1 步 · 运行安装程序</h3>
      <p>进入 <code>Setup</code> 文件夹，双击 <code>ArcGIS_Desktop_1082_180378.exe</code>。首先选择解压位置（默认 <code>C:\\Users\\用户名\\Documents\\ArcGIS 10.8</code>），点击 Next，等待安装包自动解压。</p>
      <h3>第 2 步 · 启动安装向导</h3>
      <p>解压完成后保持默认勾选 <code>Launch the setup program</code>，点击 <strong>Close</strong>，安装向导会自动启动。</p>
      <h3>第 3 步 · 完成安装向导</h3>
      <ul>
        <li>欢迎页：直接点 <strong>Next</strong></li>
        <li>许可协议：选择 <strong>I accept the master agreement</strong>，点 Next</li>
        <li>安装类型：选择 <strong>Complete（典型安装，推荐）</strong>，点 Next</li>
        <li>安装路径：保持默认 <code>C:\\Program Files\\ArcGIS\\Desktop10.8</code>，点 Next</li>
        <li>Python 组件：确认所需组件后继续点 Next</li>
      </ul>
      <p class="warn">⚠️ 安装路径最好不要改动，保持默认！</p>
      <h3>第 4 步 · 开始安装</h3>
      <p>在 Ready to Install 页面，<strong>取消勾选</strong>参与 Esri 用户体验改进计划（<code>Yes, I would like to participate...</code>），点击 <strong>Install</strong> 开始安装，等待安装结束点击 <strong>Finish</strong>。</p>
      <h3>第 5 步 · 关闭许可向导</h3>
      <p>安装完成后会自动弹出 <code>ArcGIS Administrator Wizard</code> 窗口，直接点击 <strong>OK</strong> 关闭即可。</p>
      <h3>第 6 步 · 破解激活</h3>
      <p>复制 <code>Crack</code> 文件夹中的 <code>Afcore.dll</code> 文件，粘贴替换到软件安装路径：</p>
      <p><code>C:\\Program Files (x86)\\ArcGIS\\Desktop10.8\\bin</code></p>
      <p class="warn">🚨 破解文件必须复制替换到位，否则启动时会提示许可证错误！注意路径是 x86 目录。</p>
      <h3>第 7 步 · 启动验证</h3>
      <p>在开始菜单中启动 <strong>ArcMap</strong>，此时因为还没有汉化，界面还是英文版；能看到初始化许可证界面并正常进入主界面，即为激活成功。</p>
      <h3>第 8 步 · 安装汉化包</h3>
      <p>打开汉化包文件夹，双击 <code>ArcGIS_DesktopLP_chs_1082_180381.exe</code>，按提示解压并完成安装。安装结束后再次启动 ArcMap，即已完成汉化。</p>
      <hr>
      <h2>三、注意事项</h2>
      <ul>
        <li class="warn">🚨 安装前建议先退出杀毒软件 / Windows Defender，避免破解文件被误删</li>
        <li>⚠️ 安装路径不要包含中文或特殊字符</li>
        <li>⚠️ 若启动提示许可证错误，检查 <code>Afcore.dll</code> 是否已正确替换到 bin 目录</li>
        <li>本资源仅供个人学习交流，请在下载后 24 小时内删除；如有侵权请联系删除</li>
      </ul>
      <hr>
      <h2>四、下载资源</h2>
      <p><strong>软件安装包</strong>（第三方网盘分享，本站不存储、不提供文件）：</p>
      <p>
        <a href="https://1840196271.share.123pan.cn/123pan/v9fWTd-3ebdh" target="_blank" rel="noopener" style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 0;text-decoration:none">下载 ArcGIS 10.8.2 安装包（123 云盘 · 3.22 GB）</a>
      </p>
      <p>提取码：<span class="warn">不在站内展示</span>，请向站长获取（微信：Y18725560542）。｜下载需<strong>注册并登录 123 云盘账号</strong>，建议用<strong>官方客户端</strong>下载（流量按 50% 计、支持断点续传）。</p>
      <p>下方为配套的说明文档原件，可直接下载：</p>
      <p>
        <a href="downloads/software/arcgis-guide-original.zip" download style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 0;text-decoration:none">下载《ArcGIS10.8 安装说明》原件（长图 JPEG · 1.1 MB）</a>
      </p>
      <p>解压密码（全部文件通用）：<span class="warn">不在站内展示</span>，请向站长获取（微信：Y18725560542）。</p>
      <p>说明原件为 zip 压缩包，Windows 资源管理器可直接解压（解压时输入上方密码）。</p>
      <p><strong>解压说明</strong>：网盘下载的安装包为 zip 压缩包，Windows 资源管理器可直接解压，解压后按上方教程安装即可。</p>
    `
  },
  {
    title: "CASS 3D（基础版 V2.0.3）安装教程与用户手册",
    category: "软件资源",
    summary: "南方 CASS_3D 三维立体数据采集软件：安装教程 + 用户手册全功能文字版，附原始安装包加密下载（密码请向站长获取）。",
    date: "2026-09-17",
    tags: ["CASS3D", "CASS"],
    cover: "assets/tagpics/cass3d-card.jpg?v=20260917",
    content: `
      <div class="callout">📌 本文档整理自官方《CASS_3D 用户手册》（基础版 V2.0.3，广东南方数码科技股份有限公司）及安装说明，仅供个人学习交流使用，如有侵权请联系删除。</div>
      <hr>
      <h2>一、软件简介</h2>
      <p><strong>CASS_3D</strong> 南方三维立体数据采集软件由广东南方数码科技股份有限公司自主研发，是一款<strong>挂接式安装至 CASS（南方地形地籍成图软件）的插件式软件</strong>。</p>
      <p>CASS_3D 支持 CASS 环境下<strong>倾斜三维模型的加载与浏览</strong>，支持<strong>三维模型直接采集、补测 DLG 数据</strong>。随着无人机航测、三维激光扫描等技术日益发展，DSM（数字地表模型）三维信息数据越来越多地被应用到测绘数据生产项目中，CASS_3D 正是面向新数据源、新生产方式的解决方案。</p>
      <hr>
      <h2>二、运行环境</h2>
      <p>CASS_3D 是挂接安装在 CASS 平台的软件，安装前需确保操作系统内<strong>已安装好 AutoCAD 及 CASS 软件</strong>：</p>
      <ul>
        <li><strong>AutoCAD 适配版本</strong>：[32 位] CAD2005–2018；[64 位] CAD2010–2020</li>
        <li><strong>CASS 适配版本</strong>：CASS7.1 / 2008 / 9.2 / 10.1</li>
        <li><strong>操作系统</strong>：WIN7 及以上</li>
      </ul>
      <hr>
      <h2>三、安装教程</h2>
      <h3>第 1 步 · 运行安装程序</h3>
      <p>解压 CASS_3D 压缩包，双击解压文件夹内 <code>Cass3DInstall.exe</code>，弹出 CASS_3D 安装界面。</p>
      <p class="warn">⚠️ 安装时最好保证 CASS 已关闭，并以<strong>管理员身份</strong>运行 Cass3DInstall.exe；安装失败可尝试右键管理员身份运行。</p>
      <h3>第 2 步 · 依据安装向导安装</h3>
      <p>依据安装向导提示安装 CASS_3D。若操作系统内安装了<strong>多个 CASS 版本</strong>，安装过程中还可选择需安装 CASS_3D 的目标 CASS 版本。</p>
      <h3>第 3 步 · 软件授权</h3>
      <p>CASS_3D 支持三种授权方式：</p>
      <ul>
        <li><strong>深思硬件锁授权</strong>（现仅支持深思五代蓝色硬件狗）</li>
        <li><strong>云授权</strong></li>
        <li><strong>软授权</strong></li>
      </ul>
      <p>详细授权方法可参考官方《深思授权操作说明》。</p>
      <hr>
      <h2>四、操作流程指引</h2>
      <p>一次典型的三维采集作业流程：</p>
      <ul>
        <li>① 启动 CASS，可打开 dwg 数据加载底图</li>
        <li>② 点击工具条 <code>Open3D</code> 图标（或命令窗执行 <code>dsmload</code>），加载倾斜三维模型，打开 CASS_3D 三维窗口</li>
        <li>③ 点击工具条 <code>视口内实体同步显示</code>，将二维实体同步至三维窗口中</li>
        <li>④ 使用 CASS 绘图工具在三维空间直接采集地物；如已加载底图 dwg 数据，也可依据三维信息编辑、修正底图数据</li>
        <li>⑤ 保存 dwg 数据</li>
      </ul>
      <hr>
      <h2>五、操作手册</h2>
      <h3>5.1 软件界面</h3>
      <p>CASS_3D 加载三维模型后，原 CASS 主界面会<strong>追加三维浏览窗口</strong>，三维窗口上侧为 CASS_3D 菜单栏（各功能详见 5.6 功能详解）。</p>
      <h3>5.2 三维浏览</h3>
      <p>CASS 平台下二、三维窗口为<strong>联动操作</strong>，当鼠标指针位于三维窗口时：</p>
      <table>
        <tr><th>操作</th><th>方式</th></tr>
        <tr><td>缩放窗口</td><td>滑动鼠标滚轮</td></tr>
        <tr><td>平移窗口</td><td>按住鼠标滚轮并拖动鼠标</td></tr>
        <tr><td>旋转视角</td><td>按住鼠标左键并拖动鼠标</td></tr>
        <tr><td>全图</td><td>双击滚轮</td></tr>
      </table>
      <p>注意：</p>
      <ul>
        <li>① 三维窗口内只可点选要素，框选操作只可由二维窗口完成</li>
        <li>② <code>ESC</code> 键 / 鼠标右键取消三维窗口选择状态</li>
        <li>③ 绘制过程中按住 <code>Ctrl</code> 键可锁定三维视口旋转状态，提高采集速度</li>
        <li>④ 先按住 <code>Ctrl</code> 再按 <code>Tab</code>，可快速旋转三维模型朝向正北；单击 <code>Tab</code> 键，顺时针旋转三维窗口 90°</li>
      </ul>
      <h3>5.3 绘制图形</h3>
      <p>采集模式分为<strong>二维绘图模式</strong>和<strong>三维绘图模式</strong>，通过工具条上的 2D/3D 模式切换键切换。二维模式与 CASS 平台绘制一致。三维模式下以绘制房屋为例：</p>
      <ul>
        <li><code>W 键 · 直角绘图</code>：采集同一墙面上任意两点为首边定向，随后依次采集其它墙面任意一点至完成图形。可连续进行，再按 W 退出</li>
        <li><code>S 键 · 重定向</code>：若相邻墙面并非垂直，按 S 进行直线绘图——每个墙面采集两点作定向，自动与其他房屋边交汇得到交点。可连续进行，再按 S 退出</li>
        <li><code>D 键 · 捕点</code>：自动采集光标所在位置处点位</li>
      </ul>
      <h3>5.4 编辑图形</h3>
      <p>CASS_3D 沿用 CAD 与 CASS 编辑功能，但<strong>窗口内不支持框选</strong>，也不可直接编辑节点；节点编辑需借助三维工具条（见 5.6）。</p>
      <h3>5.5 捕捉快捷键</h3>
      <p>三维窗口内绘制/编辑时，窗口左上角会提示可用捕捉快捷键（可在设置中自定义和重置）：</p>
      <table>
        <tr><th>快捷键</th><th>功能</th></tr>
        <tr><td><code>E</code></td><td>捕捉离光标最近的线上点（含高程）</td></tr>
        <tr><td><code>B</code></td><td>捕捉离光标最近的线上端点（含高程）</td></tr>
        <tr><td><code>P</code></td><td>捕捉离光标最近的线上垂足点（含高程）</td></tr>
        <tr><td><code>T</code></td><td>捕捉最近线上点的 XY 坐标，高程取光标点击的模型位置</td></tr>
        <tr><td><code>Y</code></td><td>捕捉最近线上端点的 XY 坐标，高程取光标点击的模型位置</td></tr>
      </table>
      <h3>5.6 功能详解（CASS3D 菜单栏）</h3>
      <h4>① 3D 工具条 · 生成模型索引（createTileIndex）</h4>
      <p>对已有瓦片模型和元数据、但无索引文件的三维模型，可自动构建 <code>.osgb</code> 格式索引文件用于载入。<strong>数据存放要求</strong>：瓦片数据文件夹放在 data 文件夹下，元数据 xml 文件需与 data 文件夹同级。</p>
      <h4>② 开关模型</h4>
      <ul>
        <li><code>打开模型（DsmLoad）</code>：打开三维窗口加载模型。索引文件格式支持 <code>osgb / obj / s3c / xml</code>，数据文件须为 osgb 格式；暂只支持加载单个模型</li>
        <li><code>关闭模型</code>：关闭三维窗口</li>
      </ul>
      <h4>③ 绘图模式</h4>
      <ul>
        <li><code>2D 二维绘图</code>：DD 命令直接沿用 CASS，快捷键提示与 CASS 一致</li>
        <li><code>3D 三维绘图</code>：DD 命令使用 CASS3D 的，快捷键提示与 CASS 不同</li>
      </ul>
      <h4>④ 屏幕模式</h4>
      <ul>
        <li><code>分屏</code>：三维与二维窗口 1:1 显示，拖动分隔线可调整占比</li>
        <li><code>弹窗</code>：弹出三维窗口，二三维分离显示</li>
        <li><code>全屏</code>：仅显示三维模型</li>
      </ul>
      <h4>⑤ 视角</h4>
      <ul>
        <li><code>俯视</code>：锁定/取消锁定俯视状态（锁定后无法旋转模型）</li>
        <li><code>侧视</code>：三维水平视角顺时针旋转 90°</li>
      </ul>
      <h4>⑥ 同步矢量（3DSynchronize）</h4>
      <p>将二维窗口内当前显示的实体同步显示到三维窗口中。注意：<strong>只对三维视口范围内的实体生效</strong>，如需同步全图需先将三维窗口置为全图。</p>
      <h4>⑦ 插入影像</h4>
      <p>在二维窗口插入正射影像数据。</p>
      <h4>⑧ 高程点</h4>
      <p><strong>闭合区域提取高程点（dsmControlPt）</strong>：根据设定间距，在模型上指定或绘制的闭合范围线内按指定方向等距生成高程点，适用于裸地或建筑物、植被不多的模型。操作：点击"面内提取高程点" → 选择闭合线或输入 D 绘制闭合线 → 在弹出对话框设置<strong>采点间距</strong>和<strong>提取精度</strong> → 确定等待生成。</p>
      <p class="warn">⚠️ 提取精度为所调用的瓦片数据层级，精度越高高程点越准确，但耗时越久。</p>
      <p><strong>线上提取高程点（lineElev）</strong>：按等分或等距方式在线实体上自动生成高程点。三种方式：等分（沿线平均分布指定数量）、等距（按设定间隔等距生成）、节点提取（仅线端点）。操作：选择线实体 → 选提取方式、设提取精度 → 确定。</p>
      <h4>⑨ 等高线</h4>
      <p><strong>绘制等高线（drawIsohypse）</strong>：设定等高距（默认 1 米），指定模型上某一固定高程值手动采集。三维窗口会自动隐藏小于该高程的模型，沿模型切面采集，默认生成首曲线编码。快捷键：<code>Up/Down</code> 按等高距增减当前高程、<code>右键</code>结束单次绘制、<code>Tab</code> 开关边界吸附、<code>Esc</code> 结束功能。</p>
      <p><strong>提取等高线（extractIsohypse）</strong>：自动提取闭合范围内等高线。可选批量/单条提取及拟合方式。模型存在较多陡峭山谷山脊时可修改采样间距（建议 0.2–3），值越小贴合度越高、耗时越长。</p>
      <p><strong>局部调整等高线（adjustContourLine）</strong>：根据三维模型调整单条等高线局部位置。选择等高线后，小于其高程的模型被隐藏，单击左键或按 D 采点修改；右键结束单条、再次右键退出命令。</p>
      <h4>⑩ 节点编辑</h4>
      <table>
        <tr><th>功能</th><th>命令</th><th>说明</th></tr>
        <tr><td>实体加点</td><td><code>SD_AP</code></td><td>选线实体 → 在需增加节点处单击左键（可连续）</td></tr>
        <tr><td>实体删点</td><td><code>SD_DP</code></td><td>选线实体 → 在需删除节点上单击左键（可连续）</td></tr>
        <tr><td>移动实体点</td><td><code>SD_MP</code></td><td>选待移动节点 → 点击目标位置（可连续）</td></tr>
        <tr><td>修改三维坐标</td><td><code>3D_EditCoord</code></td><td>修改或导出选中实体的节点 XYZ 坐标</td></tr>
      </table>
      <h4>⑪ 数据采编</h4>
      <p><strong>偏移拷贝（SD_OFFSET）</strong>：选实体单边或连线实体边界两点作为基底内外推动构面，多用于快速绘制阳台、飘楼等。分单边偏移（整体偏移两点间线段）和两点偏移（输入 L 选两点，按 H 换向）。</p>
      <p><strong>更改矢量高度（dsmHeight）</strong>：三种修改方式——输入标高 / 图面点击标高点 / <strong>贴合模型表面</strong>（矢量贴模）。</p>
      <p><strong>修线（SD_join）</strong>：对线实体局部修改。修正线与原实体多个交点时自动处理；仅一个交点时需选保留端。<strong>修正线第一个节点需与原实体相交或尽量靠近</strong>，否则失败。</p>
      <p><strong>修角（SD_Tran）</strong>：修复智能绘房房棱角点。点击修角折线段，程序自动识别两侧边线并延长至交点。</p>
      <p><strong>增加辅助点（3D_DRAWASPOINT）</strong>：绘制 0.1 米半径圆形点实体作辅助标识。</p>
      <p><strong>还原线宽（CASS3D_ResetWidth）</strong>：CASS_3D 采集/编辑的 dwg 成果打印前需还原线宽，保证线宽正确。<strong>还原前最好先备份 dwg</strong>——还原后再与三维模型套合需重新提取高程。</p>
      <h4>⑫ 设置与其他</h4>
      <p><strong>常规设置</strong>主要项：双击左键启用（智能绘房入口）、输入绘制参数（房屋结构/层数属性）、绘房编码、二三维同步旋转、三维窗口位置（左/右）、三维光标颜色、自动拟合（直角绘房后拟合重算，要求模型质量高，一般不勾选）、线型详绘、房屋显示立体效果、直角绘房立体显示、房屋高程计算方式（房顶/房底/第一点/最后一点）、打开 dwg 时自动加载模型。</p>
      <p><strong>快捷键设置</strong>：自定义三维窗口捕捉快捷键。</p>
      <p><strong>智能采集</strong>：自动提取模型矢量边界，快捷高效的建筑采集方式。前提：设置中勾选"双击左键启用"。操作：① 左键双击单个房屋墙面启用智能绘房 ② 调整采集切面至最佳位置 ③ 右键提交。以双击处水平切面提取矢量边界，界面左下可预览 DLG 效果；效果不理想可滚轮调节切面，<strong>Ctrl+滚轮调节识别区域</strong>。</p>
      <p><strong>二次开发帮助</strong>：CASS_3D 二次开发接口函数提示。</p>
      <hr>
      <h2>六、注意事项</h2>
      <ul>
        <li class="warn">🚨 安装前关闭 CASS，并以管理员身份运行安装程序</li>
        <li>⚠️ 三维模型索引支持 osgb / obj / s3c / xml，数据文件须为 osgb 格式</li>
        <li>⚠️ dwg 成果打印前记得还原线宽，且先备份</li>
        <li>本资源仅供个人学习交流；如有侵权请联系删除</li>
      </ul>
      <hr>
      <h2>七、下载资源</h2>
      <p><strong>软件安装包</strong>（第三方网盘分享，本站不存储、不提供文件）：</p>
      <p>
        <a href="https://1840196271.share.123pan.cn/123pan/v9fWTd-WDfdh" target="_blank" rel="noopener" style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 0;text-decoration:none">下载 CASS 3D 基础版 V2.0.3 安装包（123 云盘 · 77 MB）</a>
      </p>
      <p>提取码：<span class="warn">不在站内展示</span>，请向站长获取（微信：Y18725560542）。｜下载需<strong>注册并登录 123 云盘账号</strong>，建议用<strong>官方客户端</strong>下载（流量按 50% 计、支持断点续传）。</p>
      <p>下方为配套的用户手册与安装说明原件，可直接下载：</p>
      <p>
        <a href="downloads/software/cass3d-manual.zip" download style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 0;text-decoration:none">下载《CASS_3D 用户手册 + 安装说明》原件（PDF + TXT · 2.7 MB）</a>
      </p>
      <p>解压密码（全部文件通用）：<span class="warn">不在站内展示</span>，请向站长获取（微信：Y18725560542）。</p>
      <p><strong>解压说明</strong>：网盘下载的安装包为 RAR 压缩包，需用 WinRAR / 7-Zip / 360压缩 等解压软件解压（Windows 自带解压不支持 RAR），解压后得到 <code>CASS_3D基础版V2.0.3安装包</code> 文件夹，双击其中 <code>Cass3DInstall.exe</code> 按上方教程安装。手册原件为 zip 压缩包，Windows 资源管理器可直接解压（解压时输入上方密码）。</p>
    `
  },
  {
    title: "AutoCAD 2020（64位）安装教程",
    category: "软件资源",
    summary: "AutoCAD 2020 64位完整安装+激活教程（文字版全 22 步）：主程序安装、序列号激活、注册机生成激活码全流程。",
    date: "2026-09-17",
    tags: ["AutoCAD"],
    cover: "assets/tagpics/cad2020-card.jpg?v=20260917",
    content: `
      <div class="callout">📌 本教程整理自网络资源，包含 <strong>主程序安装 + 序列号激活 + 注册机激活</strong> 全流程，仅供个人学习交流使用，如有侵权请联系删除。</div>
      <p class="warn">⚠️ 解压【CAD2020】前：先关闭所有杀毒软件（部分电脑自带的"迈克菲"也要关闭）、防火墙、Windows Defender，否则可能被杀毒软件误杀，导致无法运行或缺失某些程序。</p>
      <hr>
      <h2>一、安装主程序</h2>
      <h3>第 1 步 · 解压</h3>
      <p>鼠标右击【CAD2020】压缩包，选择【解压到 CAD2020】。</p>
      <h3>第 2 步 · 进入安装包</h3>
      <p>打开解压后的文件夹，双击打开【安装包】文件夹。</p>
      <h3>第 3 步 · 运行安装程序</h3>
      <p>鼠标右击【Setup】，选择【以管理员身份运行】。</p>
      <h3>第 4 步 · 开始安装</h3>
      <p>点击【安装】。</p>
      <h3>第 5 步 · 接受协议</h3>
      <p>选择【我接受】，点击【下一步】。</p>
      <h3>第 6 步 · 选择安装位置</h3>
      <p>点击【浏览】可更改安装位置（建议不要安装在 C 盘，可以在 D 盘或其它磁盘下新建一个"CAD2020"文件夹。注意：安装路径中不能有中文），点击【安装】。</p>
      <h3>第 7 步 · 等待安装</h3>
      <p>软件安装中（大约需要 10 分钟）。</p>
      <h3>第 8 步 · 完成安装</h3>
      <p>安装完成，点击【立即启动】。</p>
      <h3>第 9 步 · 进入激活</h3>
      <p>点击【确定】。</p>
      <hr>
      <h2>二、激活软件</h2>
      <h3>第 10 步 · 输入序列号</h3>
      <p>点击【输入序列号】→ 点击【我同意】→ 点击【激活】。</p>
      <h3>第 11 步 · 填写序列号与产品密钥</h3>
      <p>输入序列号 <code>666-69696969</code>，输入产品密钥 <code>001L1</code>，点击【下一步】。</p>
      <h3>第 12 步 · 退出重进激活界面</h3>
      <p>点击右上角【X】退出 → 点击【激活】→ 再次输入序列号 <code>666-69696969</code>、产品密钥 <code>001L1</code>，点击【下一步】。</p>
      <h3>第 13 步 · 选择激活码方式</h3>
      <p>选择【我具有 Autodesk 提供的激活码】（<strong>不要关闭此界面</strong>）。</p>
      <h3>第 14 步 · 运行注册机</h3>
      <p>打开安装包解压后的【CAD2020（64bit）】文件夹，鼠标右击【xf-adesk20】，选择【以管理员身份运行】。</p>
      <p class="warn">⚠️ 运行【xf-adesk20】前：同样先关闭所有杀毒软件（部分电脑自带的"迈克菲"也要关闭）、防火墙、Windows Defender，否则可能被误杀。若已经没有该文件，需重新解压安装包。</p>
      <h3>第 15 步 · 生成激活码</h3>
      <ul>
        <li>① 使用快捷键 <code>Ctrl+C</code> 复制【申请号】后的代码</li>
        <li>② 使用快捷键 <code>Ctrl+V</code> 将代码粘贴到【Request】后的框中</li>
        <li>③ 点击【Patch】，点击【确定】</li>
        <li>④ 点击【Generate】生成激活码</li>
      </ul>
      <h3>第 16 步 · 输入激活码</h3>
      <ul>
        <li>① 使用快捷键 <code>Ctrl+C</code> 复制【Activation】后框中的激活码</li>
        <li>② 使用快捷键 <code>Ctrl+V</code> 将激活码粘贴到【激活码输入框】中</li>
        <li>③ 点击【Quit】</li>
        <li>④ 点击【下一步】</li>
      </ul>
      <h3>第 17 步 · 激活完成</h3>
      <p>激活成功，点击【完成】。安装成功。</p>
      <hr>
      <h2>三、下载资源</h2>
      <p><strong>软件安装包</strong>（第三方网盘分享，本站不存储、不提供文件）：</p>
      <p>
        <a href="https://1840196271.share.123pan.cn/123pan/v9fWTd-lYd3h" target="_blank" rel="noopener" style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 0;text-decoration:none">下载 AutoCAD 2020（64位）安装包（123 云盘 · 2.03 GB）</a>
      </p>
      <p>提取码：<span class="warn">不在站内展示</span>，请向站长获取（微信：Y18725560542）。｜下载需<strong>注册并登录 123 云盘账号</strong>，建议用<strong>官方客户端</strong>下载（流量按 50% 计、支持断点续传）。</p>
      <p>下方为配套的安装教程原件，可直接下载：</p>
      <p>
        <a href="downloads/software/cad2020-tutorial-original.zip" download style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 0;text-decoration:none">下载《CAD2020 安装教程》原件（DOCX · 0.9 MB）</a>
      </p>
      <p>解压密码（全部文件通用）：<span class="warn">不在站内展示</span>，请向站长获取（微信：Y18725560542）。</p>
      <p>教程原件为 zip 压缩包，Windows 资源管理器可直接解压（解压时输入上方密码）。</p>
      <p><strong>解压说明</strong>：安装包向站长获取后，用 WinRAR / 7-Zip / 360压缩 等解压软件解压（Windows 自带解压不支持 RAR），解压后按上方教程安装即可。</p>
    `
  },
  {
    title: "CASS 11.0.0.8 安装教程（适合 CAD2010-2023）",
    category: "软件资源",
    summary: "南方 CASS 11.0.0.8 安装教程（文字版全 16 步）：主程序安装、狗驱动、注册码授权全流程，附安装前必读注意事项。",
    date: "2026-09-17",
    tags: ["CASS", "南方测绘"],
    cover: "assets/tagpics/cass11-card.jpg?v=20260917",
    content: `
      <p class="warn" style="border:1px solid rgba(255,70,31,.55);border-radius:10px;padding:14px 18px">🚨 <strong>安装前必读（重要）</strong><br>① 关掉所有杀毒软件后，再解压打开<br>② BIOS 关掉虚拟机（虚拟化）问题<br>③ 属性里设为 Everyone</p>
      <div class="callout">📌 本教程整理自网络资源（适合 CAD2010-2023 版本），仅供个人学习交流使用，如有侵权请联系删除。</div>
      <hr>
      <h2>一、安装前说明</h2>
      <p>安装南方 CASS 11.0 软件需要在电脑上<strong>先安装 AutoCAD</strong>，南方 CASS 11.0 支持 <strong>CAD2010-2023 版本</strong>。电脑上没有安装 CAD 的，需要先安装 CAD（可参考本站 AutoCAD 2020 安装教程）。</p>
      <hr>
      <h2>二、安装 CASS 主程序</h2>
      <h3>第 1 步 · 解压</h3>
      <p>选中下载的压缩包，鼠标右键选择解压到"CASS11.0.0.8"。</p>
      <h3>第 2 步 · 运行安装文件</h3>
      <p>打开刚刚解压的文件夹，双击打开"CASS11.0.0.8安装文件"，鼠标右键点击 <code>CASS11.0.0.8 for AutoCAD2010-2023.exe</code>，选择【以管理员身份运行】。</p>
      <h3>第 3 步 · 自定义安装</h3>
      <p>点击"自定义安装"。</p>
      <h3>第 4 步 · 选择 CAD 版本</h3>
      <p>南方 CASS 11.0 会自动识别电脑已经安装的 CAD 版本。如果电脑上安装有多个 CAD 版本，可以选择一个版本（本教程以 CAD2023 为例）。</p>
      <h3>第 5 步 · 选择安装路径</h3>
      <p>选择软件安装路径，建议和教程中的保持一致，本例安装到 D 盘（将路径地址中的首字符 C 改为 D 表示安装到 D 盘，或者可以在其它磁盘里创建一个新的文件夹，<strong>安装路径不要出现中文</strong>）。勾选"已阅读并同意"，点击"一键安装"。</p>
      <h3>第 6 步 · 等待安装</h3>
      <p>软件安装需要一些时间，请耐心等待。</p>
      <h3>第 7 步 · 完成安装</h3>
      <p>点击"安装完成"。</p>
      <hr>
      <h2>三、安装狗驱动</h2>
      <h3>第 8 步 · 运行狗驱动</h3>
      <p>返回"CASS11.0.0.8安装文件"文件夹，找到并选中 <code>cass11狗驱动.exe</code> 文件，鼠标右键选择【以管理员身份运行】。</p>
      <h3>第 9 步 · 驱动向导</h3>
      <p>点击"下一步"。</p>
      <h3>第 10 步 · 选择加密类型</h3>
      <p>加密类型选择"注册码版"，点击"下一步"。</p>
      <h3>第 11 步 · 完成驱动安装</h3>
      <p>点击"完成"。</p>
      <hr>
      <h2>四、复制授权文件</h2>
      <h3>第 12 步 · 复制 key 文件</h3>
      <p>返回之前解压的"CASS11.0.0.8"文件夹，依次打开"CASS11注册机——通用授权"文件夹，找到并选中 <code>ca123.key</code> 文件，鼠标右键选择"复制"。</p>
      <h3>第 13 步 · 粘贴到安装路径</h3>
      <p>依次打开 CASS11 软件安装路径（如 <code>D:\\Program Files\\CASS11 For AutoCAD 2023\\bin</code>，路径中"CASS11 For AutoCAD 2023"对应你安装的 CAD 版本），在打开的文件夹空白处，鼠标右键"粘贴"刚才复制的文件。</p>
      <hr>
      <h2>五、运行软件</h2>
      <h3>第 14 步 · 启动 CASS11</h3>
      <p>双击图标，运行软件。</p>
      <p class="warn">⚠️ 如果软件打不开：在桌面上找到"CASS11 For AutoCAD"软件图标，鼠标右键点击"属性" → 点击"兼容性" → 勾选"以管理员身份运行此程序" → 点击"确定"。</p>
      <h3>第 15 步 · 生成纯 CAD 快捷方式</h3>
      <p>点击"文件"，找到并点击"生成纯属CAD快捷方式"（即生成纯 CAD 快捷方式），桌面会生成一个 CAD 快捷图标，打开就是单独的 CAD 了。</p>
      <h3>第 16 步 · 安装完成</h3>
      <p>安装完成。</p>
      <hr>
      <h2>六、下载资源</h2>
      <p><strong>软件安装包</strong>（第三方网盘分享，本站不存储、不提供文件）：</p>
      <p>
        <a href="https://1840196271.share.123pan.cn/123pan/v9fWTd-D4k3h" target="_blank" rel="noopener" style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 14px;text-decoration:none">下载 CASS 11.0.0.8 安装包（123 云盘 · 646 MB）</a>
      </p>
      <p>提取码：<span class="warn">不在站内展示</span>，请向站长获取（微信：Y18725560542）。｜下载需<strong>注册并登录 123 云盘账号</strong>，建议用<strong>官方客户端</strong>下载（流量按 50% 计、支持断点续传）。</p>
      <p>下方为配套的安装教程与注意事项原件，可直接下载：</p>
      <p>
        <a href="downloads/software/cass11-tutorial-original.zip" download style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 0;text-decoration:none">下载《CASS11 安装教程 + 注意事项》原件（DOCX + TXT · 2.2 MB）</a>
      </p>
      <p>解压密码（全部文件通用）：<span class="warn">不在站内展示</span>，请向站长获取（微信：Y18725560542）。</p>
      <p>教程原件为 zip 压缩包，Windows 资源管理器可直接解压（解压时输入上方密码）。</p>
      <p><strong>解压说明</strong>：网盘下载的安装包为 zip 压缩包，Windows 资源管理器可直接解压；解压后按上方教程安装即可。再次提醒：解压前先关闭杀毒软件。</p>
    `
  },
  {
    title: "Office Tool Plus：Office 全家桶安装激活教程",
    category: "软件资源",
    summary: "围绕 Office 部署工具 Office Tool Plus 展开，覆盖下载安装、旧版本卸载、部署 Office、KMS 激活全流程，附教程原件下载。",
    date: "2026-09-17",
    tags: ["Office"],
    cover: "assets/tagpics/officetool-card.jpg?v=20260917",
    content: `
      <div class="callout">本教程围绕一款名为 <strong>Office Tool Plus</strong> 的 Office 安装部署工具展开（官方口号是「Easy &amp; fast」，一个强大且实用的 Office 部署工具），覆盖下载安装、卸载旧版本、部署 Office、KMS 激活全流程。配套视频：<a href="https://www.bilibili.com/video/BV11mZ5BfEBP/" target="_blank">bilibili 视频教程</a>。</div>
      <hr>
      <h2>一、下载 Office Tool Plus 工具</h2>
      <h3>第 1 步 · 进入官网下载页</h3>
      <p>打开浏览器，进入官网下载页：<code>https://otp.landian.vip/zh-cn/download.html</code>。官网页面显示：最新版本为 10.29.50.0；系统要求 <strong>Windows 10</strong> 或 <strong>Windows Server 2016</strong> 及以上（不支持 Linux、macOS 等其他系统）。</p>
      <h3>第 2 步 · 选择版本下载</h3>
      <p>页面提供 64 位版本、32 位版本、ARM64 版本等多种选择。点击 64 位版本右侧的倒三角，可以选择「山东大学镜像站」进行下载（镜像站只是用来做演示，如果使用不了，可以换其他的下载源，或者直接点击「64 位」按钮也能下载）。</p>
      <h3>第 3 步 · 解压运行</h3>
      <p>下载得到一个压缩包（形如 <code>Office_Tool_with_runtime_v10.29.50.0_x64.zip</code>），解压后运行其中的 <strong>Office Tool Plus</strong> 程序即可（同目录下还附有 Console 命令行版本）。</p>
      <p><strong>首次使用</strong>：首次打开工具会自动下载更新，稍等片刻即可正常使用。程序主界面左侧导航包含：<strong>主页、部署、激活、工具箱、文档转换、哈希值校验</strong>等模块，可以对各种 Office 软件进行统一管理。</p>
      <hr>
      <h2>二、卸载旧版本（如有）</h2>
      <p>如果你的电脑里本来就有 Office，本次只是为了更换版本，需要先卸载原先的版本。</p>
      <p>如果卸载失败或存在卸载残留，可以进入侧边栏的「<strong>工具箱</strong>」，使用其中的「<strong>移除 Office</strong>」功能——它会强制移除 Office 及相关的组件和注册表信息。</p>
      <p class="warn">⚠️ 仅当 Office 无法正常卸载时才建议使用「移除 Office」功能。电脑里没有 Office 的话，直接跳过这一步。</p>
      <hr>
      <h2>三、部署 Office</h2>
      <p>点击侧边栏的「<strong>部署</strong>」按钮进入部署界面。先不用管上面的选项，先来了解 Office 的版本选择。</p>
      <h3>版本标签的三种类别</h3>
      <ol>
        <li><strong>年份标签</strong>——微软官方每隔三年对 Office 进行一次大版本更新，优化体验、增加新功能，如 Office 2013、2016、2019 等历代版本。</li>
        <li><strong>套餐类别标签</strong>——指小型企业版、家庭和学生版、个人版、专业版、专业增强版、企业版等。它们的区别只是配套程序的丰富度不同：家庭和学生版只含基础办公程序，专业版则额外包含更多组件。但相同程序（如 Word、PPT）在不同套餐中功能上几乎没有区别。对应的产品 ID 例如家庭和学生版 2021（<code>HomeStudent2021Retail</code>）、专业版 2021（<code>Professional2021Retail</code>）等。</li>
        <li><strong>专用性标签</strong>——主要是 <strong>LTSC</strong> 和 <strong>SPLA</strong> 两种：<strong>LTSC（长期服务通道）</strong>不频繁更新，专注于安全性和稳定性，多用于医疗、政府机构等对稳定性要求高的行业；<strong>SPLA（服务提供商许可）</strong>面向服务提供商，例如云电脑厂商获得该许可后，即可将 Office 部署在云电脑上提供给用户使用。</li>
      </ol>
      <h3>部署操作步骤</h3>
      <ol>
        <li>点击「<strong>添加产品</strong>」，在产品列表中按需求选择版本（列表中搜索即可看到，包括 LTSC 专业增强版 2024 批量许可证、标准版 2016/2019/2021 等众多选项）。教程以 <strong>Office 专业增强版 2016</strong> 为例，满足大部分日常办公需求。</li>
        <li>选完后，在下方勾选要安装的 Office 程序：Word、PPT、Excel 表格等（OneDrive 等组件有独立开关，按需取舍）。</li>
        <li>点击「<strong>添加语言</strong>」，拉到列表最下方选择「<strong>简体中文（中国）</strong>」。</li>
        <li>回到页面最上方，点击「<strong>开始部署</strong>」进行安装。如果提示「无法安装在选定的通道上」，只需在下方切换对应通道即可。</li>
        <li>耐心等待，直到出现「<strong>一切已就绪！</strong>」的完成界面（右下角会弹出 Click-to-Run「安装完成」通知），安装就结束了。</li>
      </ol>
      <p class="warn">⚠️ 注意：此时 Office 还未激活，暂时无法正常使用，接下来进行激活。</p>
      <hr>
      <h2>四、激活 Office</h2>
      <p>Office 常见的激活方式分为三大类：</p>
      <ol>
        <li><strong>零售授权</strong>——购买一个密钥，输入后激活，绑定一台设备。</li>
        <li><strong>OEM 激活</strong>——常见于品牌机，微软与电脑厂商合作，在电脑出厂时预装 Office 的一种激活方式。</li>
        <li><strong>批量激活</strong>——又分为 <strong>MAK</strong> 和 <strong>KMS</strong> 两种：<strong>MAK</strong> 同样以输入密钥的方式激活，一个 MAK 密钥可被多台设备使用，但可用次数有限，用一次少一次；<strong>KMS</strong> 适用于大规模激活环境，用专门的 KMS 密钥配置一台获得微软授权的 KMS 服务器，客户端无需连接微软服务器，直接通过 KMS 服务器即可完成激活，一台 KMS 服务器可以为大量设备提供服务。</li>
      </ol>
      <p>教程接下来以 <strong>KMS 激活</strong>为例进行演示。</p>
      <p class="warn">⚠️ 重要提醒：本教程仅为技术分享，建议使用合规的激活方式。KMS 服务器应选择所在公司或组织提供的正规地址；文中出现的 KMS 服务器地址（如 kms.03k.org 等公共测试地址）虽能正常使用，但仅用于学习和测试，<strong>不要用于商业行为</strong>。</p>
      <h3>KMS 激活操作步骤</h3>
      <ol>
        <li>在 Office Tool Plus 中进入侧边栏的「<strong>激活</strong>」页面。</li>
        <li>先点击「<strong>卸载所有许可证</strong>」，防止残留许可证冲突。</li>
        <li>点击「<strong>安装许可证</strong>」，找到自己版本对应的许可证。注意：由于是 KMS 激活，许可证必须带有「<strong>批量许可证</strong>」标签（教程中选择的是「Office 专业增强版 2016 - 批量许可证」，产品 ID：<code>ProPlusVolume</code>）。</li>
        <li>安装成功后，到最下方点击「<strong>刷新</strong>」，确认许可证已正确加载。</li>
        <li>在「<strong>KMS 管理</strong>」一栏的 KMS 主机输入框中，填入 KMS 服务器地址（教程中以 <code>kms.03k.org</code> 为例），点击「<strong>设置主机</strong>」。</li>
        <li>最后点击最上方的「<strong>激活</strong>」按钮，稍等片刻，Office 即完成激活。</li>
      </ol>
      <p><strong>验证结果</strong>：打开 Office 的「账户」页面，在产品信息中可以看到「<strong>产品已激活</strong>——Microsoft Office 专业增强版 2016」，产品包含 Word、Excel、PowerPoint、Outlook、OneNote、Publisher、Access 七大组件，至此就可以正常使用了。</p>
      <hr>
      <h2>五、下载资源</h2>
      <p><strong>软件安装包</strong>：本站<strong>不存储</strong>任何软件文件，请<strong>联系站长获取</strong>（微信：Y18725560542）。</p>
      <p>下方为配套的教程原件，可直接下载：</p>
      <p>
        <a href="downloads/software/officetool-tutorial-original.zip" download style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 0;text-decoration:none">下载《Office 安装激活教程》原件（MD · 7 KB）</a>
      </p>
      <p>解压密码（全部文件通用）：<span class="warn">不在站内展示</span>，请向站长获取（微信：Y18725560542）。</p>
      <p>教程原件为 zip 压缩包，Windows 资源管理器可直接解压（解压时输入上方密码）。</p>
      <p><strong>解压说明</strong>：用 WinRAR / 7-Zip / 360压缩 等解压软件解压（Windows 自带解压不支持 RAR），解压时输入上方密码，得到 <code>Office Tool</code> 文件夹，运行其中的 <code>Office Tool Plus.exe</code> 即可，无需安装。工具官网：<code>https://otp.landian.vip/zh-cn/</code></p>
    `
  },
  {
    title: "苍穹三调数据库管理系统 安装配置与功能速查",
    category: "软件资源",
    summary: "苍穹三调数据库管理系统（KQ20190524 版）安装配置说明与功能速查手册：解压即用、组件注册、数据库连接配置、授权申请，附二调→三调地类映射等九大规则字典与资源包下载。",
    date: "2026-09-17",
    tags: ["苍穹", "三调", "数据库"],
    cover: "assets/tagpics/cangqiong-card.jpg?v=20260917",
    content: `
      <div class="callout">本篇整理自苍穹三调数据库管理系统（KQ20190524 版）安装包实际目录结构，分为<strong>安装配置说明</strong>（面向初次部署人员）与<strong>功能速查手册</strong>（数据建库、地类转换、图斑处理、成果输出等底层规则字典）两部分。软件解压即用，无需传统安装向导。</div>
      <hr>
      <h2>一、安装前准备</h2>
      <p><strong>系统要求：</strong></p>
      <ul>
        <li>操作系统：Windows 7 / 10（32 或 64 位）</li>
        <li>数据库（任选其一，按项目要求）：
          <ul>
            <li><strong>ArcGIS SDE + Oracle</strong>（常用组合，11g 或 10g）</li>
            <li><strong>ArcGIS SDE + 空间库（.gdb 文件地理数据库）</strong></li>
            <li><strong>Access（.mdb）</strong>（小型/单机场景）</li>
            <li>达梦、MySQL、PostgreSQL（可选，安装包内有对应驱动）</li>
          </ul>
        </li>
        <li>若走 ArcGIS 路线，需先装好 <strong>ArcGIS Desktop / ArcSDE</strong> 环境</li>
      </ul>
      <hr>
      <h2>二、安装步骤</h2>
      <h3>第 1 步 · 解压安装包</h3>
      <p>把 <code>苍穹三调数据库管理系统.zip</code> 解压到磁盘（建议英文/无空格路径，如 <code>D:\\KQ20190524</code>）。解压后得到一个 <code>苍穹三调数据库管理系统KQ20190524</code> 文件夹，即为软件主目录，<strong>无需传统安装向导，解压即用</strong>。</p>
      <h3>第 2 步 · 注册组件（关键一步）</h3>
      <p>进入主目录，按你的数据库平台运行对应的注册脚本（<strong>以管理员身份运行</strong>）：</p>
      <table>
        <tr><th>数据库环境</th><th>运行的脚本</th></tr>
        <tr><td>ArcGIS 10 + 空间库</td><td><code>DLL_Reg_Arc10.bat</code></td></tr>
        <tr><td>ArcGIS 9.3 + 空间库</td><td><code>DLL_Reg_Arc93.bat</code></td></tr>
        <tr><td>Oracle 11g + ArcGIS 10</td><td><code>DLL_Reg_For_Ora11g_Arc10.bat</code></td></tr>
        <tr><td>Oracle 10g + ArcGIS 10</td><td><code>DLL_Reg_For_Ora10g_Arc10.bat</code></td></tr>
        <tr><td>Oracle + ArcGIS 9.3</td><td><code>DLL_Reg_For_Ora10g_Arc93.bat</code> / <code>DLL_Reg_For_Ora11g_Arc93.bat</code></td></tr>
        <tr><td>达梦数据库</td><td><code>DLL_Reg_For_KqDM.bat</code></td></tr>
        <tr><td>MySQL</td><td><code>DLL_Reg_For_KqMySql.bat</code></td></tr>
        <tr><td>PostgreSQL</td><td><code>DLL_Reg_For_KqPG.bat</code></td></tr>
      </table>
      <p>这些脚本用 <code>RegsvrDLL.exe</code> 向系统注册对应的功能 dll。<strong>必须按实际数据库类型选对脚本</strong>，否则软件启动会报「组件未注册」。卸载/重新注册时先运行 <code>DLL_UnReg.bat</code> 反注册。</p>
      <h3>第 3 步 · 安装字体（可选，建议）</h3>
      <p>主目录下的 <code>kq.ttf</code>、<code>KqThirdLandUse.ttf</code> 是苍穹专用符号字体（地类符号、图例显示依赖它们），复制到 <code>C:\\Windows\\Fonts</code> 即可，否则图面符号可能显示为方块。</p>
      <h3>第 4 步 · 数据库建库</h3>
      <ul>
        <li>若用 <strong>Access/MDB</strong>：直接用模板库（如 <code>GDNCK2021.mdb</code>）复制改名为你的库名即可。</li>
        <li>若用 <strong>Oracle/PostgreSQL</strong>：主目录 <code>createPGDB</code> 文件夹下有 <code>createPGDB.exe</code>，可图形化创建 PostgreSQL 库；Oracle 库需先用 SQL 脚本建好空库。</li>
      </ul>
      <hr>
      <h2>三、配置步骤</h2>
      <h3>第 1 步 · 数据库连接配置（核心）</h3>
      <p>编辑主目录下的 <strong><code>ConInfo.ini</code></strong>，它定义了软件的数据库连接。文件结构如下（按你的环境填）：</p>
      <pre><code>[ArcGIS SDE FOR GDB]          ; 走 .gdb 空间库时用这一段
服务器名=
实例名=
数据库名=D:\\data\\410581.gdb
用户名=
密码=

[KQ SDE FOR MDB]              ; 走 .mdb 数据库时用这一段
服务器名=
实例名=
数据库名=C:\\data\\xxx.mdb
用户名=
密码=

[ArcGIS SDE FOR MDB]          ; 另一组连接示例
服务器名=
实例名=
数据库名=C:\\data\\340123.mdb
用户名=
密码=

[HEAND]                        ; 指定当前启用的连接类型
数据库类型=ArcGIS SDE FOR MDB</code></pre>
      <p><strong>填写要点：</strong></p>
      <ul>
        <li><code>服务器名</code>、<code>实例名</code>：走 Oracle/SDE 时填数据库服务器 IP 和 SDE 实例（如 <code>sde:oracle11g:...</code>）；走本地 mdb/gdb 时留空。</li>
        <li><code>数据库名</code>：填你的库文件完整路径（mdb/gdb）或 Oracle 服务名。</li>
        <li><code>[HEAND]</code> 段的 <code>数据库类型=</code> 决定软件实际连接哪一段配置，务必与你的环境一致。</li>
      </ul>
      <h3>第 2 步 · 授权许可配置</h3>
      <ul>
        <li><strong><code>KanqLic.ini</code></strong>：产品授权文件（内含产品列表、版本号、行政区划码），由苍穹数码发放，一般无需手动改，把售后提供的授权文件覆盖即可。</li>
        <li><strong><code>KQDistrict.ini</code></strong>：内含 <code>KQSoftID</code> 和 <code>KQLicData</code>（授权加密数据），同样是授权文件，不能手工改动。</li>
        <li><strong><code>MakeLicCode.ini</code> + <code>MakeLicCodeV20.exe</code></strong>：生成「机器码」提交给苍穹售后换取授权用。换新机器/重装系统后需重新生成机器码并申请授权。</li>
        <li><strong><code>KqLicService.ini</code></strong>：许可服务配置（网络版授权用）。</li>
      </ul>
      <p class="warn">⚠️ 授权文件（KanqLic.ini / KQDistrict.ini）与机器绑定，换电脑或重装系统后要重新申请授权。</p>
      <h3>第 3 步 · 区域（工作区）配置</h3>
      <p><strong><code>KQZoneSetting.ini</code></strong>：设置本地行政区划，如 <code>LocalZone=370306</code>（370306 = 山东淄博周村区）。改成你项目对应的行政区代码。</p>
      <h3>第 4 步 · 其他配置文件</h3>
      <table>
        <tr><th>文件</th><th>作用</th></tr>
        <tr><td><code>Schema.ini</code>（SysSet 下）</td><td>数据表结构定义</td></tr>
        <tr><td><code>SysSet/DIC/*.txt</code></td><td>地类映射、上图面积阈值等规则字典（可参考下方功能速查手册）</td></tr>
        <tr><td><code>SysSet/backup/*.bat</code></td><td>数据库备份脚本（mdbBackUp.bat / oracleBackup.bat）</td></tr>
      </table>
      <hr>
      <h2>四、启动与验证</h2>
      <ol>
        <li>双击主目录下的 <strong><code>DataBaseManage.exe</code></strong>（数据库管理系统主程序）。</li>
        <li>如需外业调查，运行 <strong><code>KqThirdLandUse.exe</code></strong>；配置工具用 <code>KqConfig.exe</code> / <code>Config.exe</code>；图式工具用 <code>KqChartShow.exe</code>。</li>
        <li>首次启动若提示「组件未注册」「无法连接数据库」，按第三节检查：注册脚本是否选对、<code>ConInfo.ini</code> 连接信息是否填对、授权文件是否有效。</li>
      </ol>
      <hr>
      <h2>五、常见问题速查</h2>
      <table>
        <tr><th>现象</th><th>原因</th><th>处理</th></tr>
        <tr><td>启动报「组件未注册」</td><td>没跑 DLL_Reg 脚本，或脚本与数据库类型不匹配</td><td>管理员身份运行对应 DLL_Reg_*.bat</td></tr>
        <tr><td>「无法连接数据库」</td><td>ConInfo.ini 连接信息/类型填错</td><td>检查 <code>[HEAND] 数据库类型</code> 和对应段配置</td></tr>
        <tr><td>符号显示为方块</td><td>专用字体未装</td><td>安装 kq.ttf、KqThirdLandUse.ttf</td></tr>
        <tr><td>提示授权无效</td><td>授权文件与机器不匹配</td><td>用 MakeLicCodeV20.exe 重新生成机器码申请授权</td></tr>
        <tr><td>换电脑后不能用</td><td>授权绑定机器</td><td>重新申请授权</td></tr>
      </table>
      <hr>
      <h2>六、功能速查手册</h2>
      <p>以下整理自安装包 <code>SysSet</code> 目录下的系统配置字典与数据字典，反映系统在数据建库、地类转换、图斑处理、成果输出等方面的底层规则，适合作为系统操作的快速参考。</p>
      <h3>6.1 二调 → 三调 地类映射（地类衔接核心规则）</h3>
      <p>这是系统把第二次全国土地调查（二调）旧地类编码自动转换为第三次全国国土调查（三调）新地类编码的依据，用于「地类衔接」环节。</p>
      <table>
        <tr><th>二调旧编码</th><th>三调新编码</th><th>二调旧编码</th><th>三调新编码</th></tr>
        <tr><td>011</td><td>0101</td><td>101</td><td>1001</td></tr>
        <tr><td>012</td><td>0102</td><td>102</td><td>1003</td></tr>
        <tr><td>013</td><td>0103</td><td>103</td><td>1004</td></tr>
        <tr><td>021</td><td>0201</td><td>104</td><td>1006</td></tr>
        <tr><td>022</td><td>0202</td><td>105</td><td>1007</td></tr>
        <tr><td>023</td><td>0204</td><td>106</td><td>1008</td></tr>
        <tr><td>031</td><td>0301</td><td>107</td><td>1009</td></tr>
        <tr><td>032</td><td>0305</td><td>111</td><td>1101</td></tr>
        <tr><td>033</td><td>0307</td><td>112</td><td>1102</td></tr>
        <tr><td>041</td><td>0401</td><td>113</td><td>1103</td></tr>
        <tr><td>042</td><td>0403</td><td>114</td><td>1104</td></tr>
        <tr><td>043</td><td>0404</td><td>115</td><td>1105</td></tr>
        <tr><td>051/052/053/054</td><td>05H1</td><td>116</td><td>1106</td></tr>
        <tr><td>063</td><td>0508</td><td>117</td><td>1107</td></tr>
        <tr><td>061</td><td>0601</td><td>118</td><td>1109</td></tr>
        <tr><td>062</td><td>0602</td><td>119</td><td>1110</td></tr>
        <tr><td>071</td><td>0701</td><td>121</td><td>1201</td></tr>
        <tr><td>072</td><td>0702</td><td>122</td><td>1202</td></tr>
        <tr><td>081/082</td><td>08H1</td><td>123</td><td>1203</td></tr>
        <tr><td>083/084/085</td><td>08H2</td><td>124</td><td>1204</td></tr>
        <tr><td>086</td><td>0809</td><td>125</td><td>1108</td></tr>
        <tr><td>087</td><td>0810</td><td>126</td><td>1205</td></tr>
        <tr><td>088/091~095</td><td>09</td><td>127</td><td>1206</td></tr>
        <tr><td>201</td><td>201</td><td>204</td><td>204</td></tr>
        <tr><td>202</td><td>202</td><td>205</td><td>205</td></tr>
        <tr><td>203</td><td>203</td><td></td><td></td></tr>
      </table>
      <p><strong>关键点：</strong></p>
      <ul>
        <li>二调的地类编码是 3 位数字，三调是 4 位（含字母）。</li>
        <li>二调的 051~054（商服用地）统一映射为三调 05H1（商业服务业设施用地）。</li>
        <li>二调的 08X（公共管理与公共服务用地）拆分为 08H1（机关团体等）、08H2（科教文卫）等。</li>
      </ul>
      <h3>6.2 举证图斑 / 零星地物 上图面积设置</h3>
      <p>系统对「举证图斑」和「零星地物」是否上图（进入成果）设有面积阈值，达到阈值的地类才上图：</p>
      <table>
        <tr><th>地类编码</th><th>名称</th><th>举证图斑上图面积(㎡)</th><th>零星地物上图面积(㎡)</th></tr>
        <tr><td>201/201A/202/202A/203/203A/204/205</td><td>城镇村及工矿用地</td><td>400</td><td>200</td></tr>
        <tr><td>05H1/0601/0602/0701/0702/08H1/08H2/0809/0810/09</td><td>建设类用地</td><td>400</td><td>200</td></tr>
        <tr><td>1001~1009、1201</td><td>交通、空闲地等</td><td>400</td><td>200</td></tr>
        <tr><td>0101/0102/0103</td><td>耕地（水田/水浇地/旱地）</td><td>800</td><td>400</td></tr>
        <tr><td>0201~0204、0301~0307、0401~0403</td><td>园地、林地、牧草地</td><td>800</td><td>400</td></tr>
        <tr><td>1006、1103/1104、1107、1202/1203</td><td>农村道路、水域、设施农用地</td><td>800</td><td>400</td></tr>
        <tr><td>0404、1101/1102/1105/1106/1108、1110、1204~1207</td><td>其他草地、河湖、滩涂、未利用地</td><td>1200</td><td>600</td></tr>
        <tr><td>1109、0508</td><td>水工建筑、物流仓储</td><td>1200</td><td>200</td></tr>
      </table>
      <p><strong>规则解读：</strong>耕地、园地、林地、牧草地等农用地阈值更高（举证 800㎡、零星 400㎡），更小块的图斑会被归并或不上图；建设类用地阈值较低（400㎡/200㎡），小图斑更容易上图；其他草地、水域、未利用地阈值最高（1200㎡/600㎡），最容易被剔除。</p>
      <h3>6.3 线状地物剔除条件及优先级别</h3>
      <p>系统对「线状地物」做自动剔除时的规则，优先级别数字越小越优先剔除：</p>
      <table>
        <tr><th>序号</th><th>地类编码</th><th>名称</th><th>宽度阈值(m)</th><th>优先级别</th></tr>
        <tr><td>1</td><td>1001</td><td>铁路用地</td><td>2.00</td><td>1</td></tr>
        <tr><td>2</td><td>1002</td><td>轨道交通用地</td><td>2.00</td><td>2</td></tr>
        <tr><td>3</td><td>1003</td><td>公路用地</td><td>2.00</td><td>2</td></tr>
        <tr><td>4</td><td>1004</td><td>城镇村道路用地</td><td>2.00</td><td>4</td></tr>
        <tr><td>5</td><td>1005</td><td>交通服务场站用地</td><td>2.00</td><td>4</td></tr>
        <tr><td>6</td><td>1006</td><td>农村道路</td><td>2.00</td><td>5</td></tr>
        <tr><td>7</td><td>1009</td><td>管道运输用地</td><td>2.00</td><td>3</td></tr>
        <tr><td>8</td><td>1101</td><td>河流水面</td><td>2.00</td><td>2</td></tr>
        <tr><td>9</td><td>1107</td><td>沟渠</td><td>2.00</td><td>6</td></tr>
        <tr><td>10</td><td>1107A</td><td>干渠</td><td>2.00</td><td>6</td></tr>
        <tr><td>11</td><td>1109</td><td>水工建筑用地</td><td>2.00</td><td>2</td></tr>
        <tr><td>12</td><td>1203</td><td>田坎</td><td>2.00</td><td>7</td></tr>
        <tr><td>13</td><td>0301</td><td>乔木林地</td><td>2.00</td><td>8</td></tr>
      </table>
      <p><strong>规则解读：</strong>所有线状地物的宽度阈值统一为 2.00 米，宽度小于 2 米的线状地物会被自动剔除（并入相邻图斑）。铁路用地优先级别最高（1），最先被处理；乔木林地最低（8），最后处理。</p>
      <h3>6.4 微小地物处理地类优先级别</h3>
      <p>系统对「微小地物」（碎小图斑）做归并处理时的优先级规则：</p>
      <table>
        <tr><th>地类编码</th><th>名称</th><th>优先级别</th></tr>
        <tr><td>1001</td><td>铁路用地</td><td>1</td></tr>
        <tr><td>1002</td><td>轨道交通用地</td><td>2</td></tr>
        <tr><td>1003</td><td>公路用地</td><td>2</td></tr>
        <tr><td>1004</td><td>城镇村道路用地</td><td>4</td></tr>
        <tr><td>1005</td><td>交通服务场站用地</td><td>4</td></tr>
        <tr><td>1006</td><td>农村道路</td><td>5</td></tr>
        <tr><td>1009</td><td>管道运输用地</td><td>3</td></tr>
        <tr><td>1101</td><td>河流水面</td><td>2</td></tr>
        <tr><td>1107</td><td>沟渠</td><td>5</td></tr>
        <tr><td>1109</td><td>水工建筑用地</td><td>5</td></tr>
        <tr><td>1203</td><td>田坎</td><td>5</td></tr>
      </table>
      <h3>6.5 线性图斑跨度地类设置</h3>
      <p>标识哪些地类在图上按「线性」方式表达（跨度的地类），1=是、0=否：</p>
      <table>
        <tr><th>是否线性</th><th>地类编码</th><th>名称</th></tr>
        <tr><td>1</td><td>1001</td><td>铁路用地</td></tr>
        <tr><td>1</td><td>1002</td><td>轨道交通用地</td></tr>
        <tr><td>1</td><td>1003</td><td>公路用地</td></tr>
        <tr><td>1</td><td>1004</td><td>城镇村道路用地</td></tr>
        <tr><td>1</td><td>1006</td><td>农村道路</td></tr>
        <tr><td>1</td><td>1009</td><td>管道运输用地</td></tr>
        <tr><td>0</td><td>1101</td><td>河流水面</td></tr>
        <tr><td>1</td><td>1107</td><td>沟渠</td></tr>
        <tr><td>1</td><td>1107A</td><td>干渠</td></tr>
      </table>
      <p>河流水面（1101）标记为 0，即不作为纯线性图斑处理，而作为面状水体处理。</p>
      <h3>6.6 城镇村范围类型 / 湿地资源类型</h3>
      <p><strong>城镇村范围类型（用于「城镇村范围」专题识别）：</strong></p>
      <table>
        <tr><th>编码</th><th>名称</th></tr>
        <tr><td>201</td><td>城市</td></tr>
        <tr><td>202</td><td>建制镇</td></tr>
        <tr><td>203</td><td>村庄用地</td></tr>
        <tr><td>204</td><td>采矿用地</td></tr>
        <tr><td>205</td><td>特殊用地</td></tr>
        <tr><td>201A</td><td>城市居民点 / 城市独立工业仓储用地</td></tr>
        <tr><td>202A</td><td>建制镇居民点 / 建制镇独立工业仓储用地</td></tr>
        <tr><td>203A</td><td>农村居民点 / 村庄独立工业仓储用地</td></tr>
      </table>
      <p><strong>湿地资源类型（用于「湿地资源」专题识别）：</strong></p>
      <table>
        <tr><th>地类编码</th><th>名称</th></tr>
        <tr><td>0101</td><td>水田</td></tr>
        <tr><td>0303</td><td>红树林地</td></tr>
        <tr><td>0304</td><td>森林沼泽</td></tr>
        <tr><td>0306</td><td>灌丛沼泽</td></tr>
        <tr><td>0402</td><td>沼泽草甸</td></tr>
        <tr><td>0603</td><td>盐田</td></tr>
        <tr><td>1101</td><td>河流水面</td></tr>
        <tr><td>1102</td><td>湖泊水面</td></tr>
        <tr><td>1103</td><td>水库水面</td></tr>
        <tr><td>1104</td><td>坑塘水面</td></tr>
        <tr><td>1105</td><td>沿海滩涂</td></tr>
        <tr><td>1106</td><td>内陆滩涂</td></tr>
        <tr><td>1107</td><td>沟渠</td></tr>
        <tr><td>1108</td><td>沼泽地</td></tr>
      </table>
      <h3>6.7 基本农田剔除线物面化地类</h3>
      <p>标识基本农田中哪些线状地物需要「面化」（由线转为面）处理：</p>
      <table>
        <tr><th>地类编码</th><th>名称</th></tr>
        <tr><td>1001</td><td>铁路用地</td></tr>
        <tr><td>1002</td><td>公路用地</td></tr>
        <tr><td>1005</td><td>农村道路</td></tr>
        <tr><td>1008</td><td>管道运输用地</td></tr>
        <tr><td>1107</td><td>沟渠</td></tr>
        <tr><td>1109</td><td>水工建筑用地</td></tr>
      </table>
      <h3>6.8 常用命令缩写对照（编辑工具栏）</h3>
      <p>系统绘图/编辑命令的缩写，可在命令行输入快速执行：</p>
      <table>
        <tr><th>缩写</th><th>命令含义</th><th>缩写</th><th>命令含义</th></tr>
        <tr><td>HD</td><td>绘制点</td><td>fg</td><td>宗地分割</td></tr>
        <tr><td>PL</td><td>绘制线</td><td>hb</td><td>宗地合并</td></tr>
        <tr><td>arc</td><td>绘制圆弧</td><td>add</td><td>宗地新增点</td></tr>
        <tr><td>rect</td><td>绘制矩形</td><td>cgjb</td><td>局部宗地重构</td></tr>
        <tr><td>cirlce</td><td>绘制正方形</td><td>cgqb</td><td>全部宗地重构</td></tr>
        <tr><td>ring</td><td>绘制圆环</td><td>plzdt</td><td>批量宗地图</td></tr>
        <tr><td>circle</td><td>绘制圆形</td><td>glzj</td><td>选择关联注记</td></tr>
        <tr><td>ellipse</td><td>绘制椭圆形</td><td>ysdm</td><td>修改要素代码</td></tr>
        <tr><td>polygon</td><td>绘制多边形</td><td>djg</td><td>生成点结构</td></tr>
        <tr><td>yanshen</td><td>延伸</td><td>xjg</td><td>生成线结构</td></tr>
        <tr><td>copy</td><td>复制</td><td>mjg</td><td>生成面结构</td></tr>
        <tr><td>break</td><td>断开</td><td>nh</td><td>曲线拟合</td></tr>
        <tr><td>trim</td><td>修剪</td><td>ckjzd</td><td>查看界址点属性</td></tr>
        <tr><td>move</td><td>局部偏移</td><td>ckjzx</td><td>查看界址线属性</td></tr>
        <tr><td>mm</td><td>实体偏移</td><td>qsx</td><td>复合线转权属线</td></tr>
        <tr><td>s</td><td>查看属性</td><td>gx</td><td>弓形界址点号重排</td></tr>
        <tr><td>lx</td><td>沿线拾取</td><td>tfwg</td><td>生成图幅网格</td></tr>
        <tr><td>jzd</td><td>修改界址点、线属性</td><td>txs</td><td>图形刷</td></tr>
        <tr><td>refresh</td><td>全部刷新宗地注记</td><td>delpt</td><td>宗地删除点</td></tr>
        <tr><td>cp</td><td>重排宗地内点号</td><td>road</td><td>重复路段处理</td></tr>
        <tr><td>cpp</td><td>重排街坊内点号</td><td></td><td></td></tr>
      </table>
      <h3>6.9 三调成果包字段映射（数据结构速查）</h3>
      <p>系统输出「三调成果包」时，数据库表与成果包（MDB/SHP）表之间的字段对应关系。主要图层（表）及核心字段：</p>
      <table>
        <tr><th>成果表名</th><th>含义</th><th>主要字段</th></tr>
        <tr><td>CLKZD / JZKZD</td><td>测量控制点 / 界址点控制点</td><td>BSM、YSDM、KZDMC、KZDDH、KZDLX、XZB、YZB、ZZB</td></tr>
        <tr><td>CJDCQ / XZQ</td><td>村级调查区 / 行政区</td><td>BSM、YSDM、XZQDM、XZQMC、DCMJ、JSMJ</td></tr>
        <tr><td>DLTB</td><td>地类图斑（核心表）</td><td>BSM、DLBM、DLMC、QSXZ、TBMJ、KCDLBM、KCXS、KCMJ、TBDLMJ、GDLX、GDPDJB、GDDB、FRDBS</td></tr>
        <tr><td>YJJBNTTB</td><td>永久基本农田图斑</td><td>BSM、JBNTTBBH、DLBM、GDLX、JBNTLX、PDJB、TKMJ、TBMJ、JBNTMJ</td></tr>
        <tr><td>KFYQ</td><td>可复垦园地（开发复垦）</td><td>KFYQMC、KFYQLX、KFYQXZ、KFYQMJ</td></tr>
        <tr><td>LSYD</td><td>临时用地</td><td>GLTBBSM、PZWJMC、PZWH、TBMJ、PZMJ、PZRQ</td></tr>
        <tr><td>PZWJSTD</td><td>批准未建设土地</td><td>TBBH、XMBH、XMMC、PZWH、PZMJ、TBMJ</td></tr>
        <tr><td>CZCDYD</td><td>城镇村等用地</td><td>CZCLX、CZCDM、CZCMC、CZCMJ</td></tr>
        <tr><td>GDDB</td><td>耕地等别（坡度分级）</td><td>DYBH、DLBM、KCDLBM、ZRD、ZRDZS、JJD、JJDZS、LYD、LYDZS</td></tr>
        <tr><td>GFBQ</td><td>国有废弃地块</td><td>XMMC、QYMJ、PZYDSJ</td></tr>
        <tr><td>TTQ</td><td>天然糖料（田坎）</td><td>TTQMJ</td></tr>
        <tr><td>各类 BHQ</td><td>各类保护区（公益林/自然保护地/水利/风景名胜等）</td><td>BHQMC、BHQDLWZ、BHQJB、PZJG、PZSJ、BHQMJ</td></tr>
        <tr><td>STBHHX</td><td>生态保护红线</td><td>MC、RKSL、QYMJ、STHJWT、GKCS</td></tr>
        <tr><td>LMFW</td><td>林地范围</td><td>ZLDWDM、KD、MJ、DLBM</td></tr>
        <tr><td>WJMHD</td><td>温带雨林/湿地相关</td><td>LYXZFLBM、ZLDWDM、MJ</td></tr>
        <tr><td>各类 _ZJ 表</td><td>各图层的「注记」子表</td><td>BSM、ZJNR、ZT、YS、BS、XZ、XHX、KD、GD、JG</td></tr>
      </table>
      <p><strong>字段命名规律（便于记忆）：</strong></p>
      <ul>
        <li><code>BSM</code>：标识码（唯一主键）；<code>YSDM</code>：要素代码；<code>BZ</code>：备注。</li>
        <li><code>TBMJ</code>：图斑面积；<code>KCMJ</code>：扣除面积；<code>TBDLMJ</code>：图斑地类面积。</li>
        <li><code>XZB/YZB/ZZB</code>：X/Y/Z 坐标；<code>HDMC</code>：核对（核实）名称。</li>
        <li><code>QSXZ</code>：权属性质；<code>QSDWDM/QSDWMC</code>：权属单位代码/名称。</li>
        <li><code>ZLDWDM/ZLDWMC</code>：坐落单位代码/名称。</li>
      </ul>
      <h3>附：系统环境与模块概览</h3>
      <p>安装包（KQ20190524 版）主要构成：</p>
      <ul>
        <li><strong>主程序</strong>：<code>DataBaseManage.exe</code>（数据库管理）、<code>Config.exe</code>、<code>KqConfig.exe</code></li>
        <li><strong>功能模块 dll</strong>：Busi.dll、Creater.dll、KqAnalyseTool.dll、CadIO.dll 等</li>
        <li><strong>数据库驱动</strong>：KqDbForArc / Ora / DM / MySql / PG（支持 ArcGIS、Oracle、达梦、MySQL、PostgreSQL）</li>
        <li><strong>注册脚本</strong>：<code>DLL_Reg_*.bat</code>（按不同数据库平台注册组件）</li>
        <li><strong>字体</strong>：kq.ttf、KqThirdLandUse.ttf（苍穹符号字体）</li>
        <li><strong>坐标系统库</strong>：数百个 <code>.prj</code>（CGCS2000、北京54、西安80 等）</li>
      </ul>
      <p class="warn">⚠️ 以上均为系统运行配置字典，反映的是「规则与参数」而非「点击操作步骤」。如需完整图文操作流程，请以苍穹数码官方随项目交付的正式手册为准。</p>
      <hr>
      <h2>七、下载资源</h2>
      <p><strong>软件安装包</strong>（第三方网盘分享，本站不存储、不提供文件）：</p>
      <p>
        <a href="https://1840196271.share.123pan.cn/123pan/v9fWTd-8jgvh" target="_blank" rel="noopener" style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 14px;text-decoration:none">① 下载软件主程序（123 云盘 · 163 MB）</a>
        <a href="https://1840196271.share.123pan.cn/123pan/v9fWTd-Qv0dh" target="_blank" rel="noopener" style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 14px;text-decoration:none">② 下载数据库模板 GDNCK2021.mdb（123 云盘 · 1043 MB）</a>
      </p>
      <p>提取码：<span class="warn">不在站内展示</span>，请向站长获取（微信：Y18725560542）。｜下载需<strong>注册并登录 123 云盘账号</strong>，建议用<strong>官方客户端</strong>下载（流量按 50% 计、支持断点续传）。</p>
      <p>下方为配套的说明文档原件，可直接下载：</p>
      <p>
        <a href="downloads/software/cangqiong-docs-original.zip" download style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 0;text-decoration:none">③ 下载《安装配置说明 + 功能速查手册》原件（MD × 2 · 17 KB）</a>
      </p>
      <p>解压密码：<span class="warn">不在站内展示</span>，请向站长获取（微信：Y18725560542）。</p>
      <p>说明原件为 zip 压缩包，Windows 资源管理器可直接解压（解压时输入上方密码）。</p>
      <p><strong>解压说明</strong>：软件主程序为 zip 压缩包，Windows 资源管理器可直接解压；数据库模板 <code>.mdb</code> 为文件本体，下载后直接使用，无需解压。</p>
      <ul>
        <li><strong>① 软件主程序</strong>：从网盘下载后解压，得到软件主目录，解压即用（按第二节注册组件、第三节配置）。</li>
        <li><strong>② 数据库模板</strong>：从网盘下载直接得到 <code>GDNCK2021.mdb</code> 模板库，复制改名即可建库（Access/MDB 场景）。</li>
      </ul>
    `
  },
  {
    title: "CASS 10.1.6 安装教程（For AutoCAD 2016）",
    category: "软件资源",
    summary: "CASS 10.1.6 完整安装包（含 AutoCAD 2016 SP1 库、CASS 安装程序、补丁与 Crack 授权工具）六步安装激活流程：断网装 CAD → 装 CASS → 装补丁 → 生成授权 → 复制授权文件 → 导入注册表。",
    date: "2026-09-17",
    tags: ["CASS"],
    cover: "assets/tagpics/cass10-card.jpg?v=20260917b",
    content: `
      <div class="callout">CASS 10.1.6 完整安装包内含：AutoCAD 2016 SP1 x64 Lite Library（CAD 基础环境）、CASS10.1.6 安装程序、CASS10.1.6 补丁、CASS10.1.6_Crack 授权工具与使用说明。按下方六步操作即可完成安装激活。</div>
      <p class="warn">⚠️ 所有软件安装保持<strong>默认安装位置</strong>，不可自行修改！</p>
      <hr>
      <h2>安装激活步骤</h2>
      <h3>第 1 步 · 解压并断网安装 CAD2016</h3>
      <p>解压 AutoCAD2016 压缩包，并<strong>断网安装</strong> CAD2016。激活说明见安装包内 <code>[...]\\AutoCAD_2016_SP1_x64_Lite_Library\\注册机</code> 目录（CAD2016 的详细安装步骤可参考本站《AutoCAD 2016（64位）安装激活教程》一文）。</p>
      <h3>第 2 步 · 安装 CASS10.1.6</h3>
      <p>安装 CASS10.1.6，安装完成后<strong>不要运行</strong>。注意：请鼠标右键安装程序，选择「<strong>以管理员身份运行</strong>」。</p>
      <h3>第 3 步 · 安装 CASS10.1.6 补丁</h3>
      <p>运行安装包内的 <code>CASS10.1.6补丁.exe</code>，完成补丁安装。</p>
      <h3>第 4 步 · 生成授权文件</h3>
      <p>解压 <code>CASS10.1.6_Crack</code> 压缩包，并生成授权文件。操作说明见 <code>[...]\\CASS10.1.6_Crack</code> 目录里的使用说明。</p>
      <h3>第 5 步 · 复制授权文件到安装目录</h3>
      <p>将生成的<strong>所有授权文件</strong>复制到 CASS 安装目录下：<code>C:\\Program Files\\Cass10.1 For AutoCAD2016\\bin\\plugins</code>。</p>
      <h3>第 6 步 · 导入注册表，完成授权</h3>
      <p>双击授权文件中的 <code>license.reg</code> 添加注册表信息，至此授权完成，再次打开 CASS 即可。</p>
      <p class="warn">⚠️ 第一次打开依旧会有弹窗，重新打开就不会再有弹窗，属正常现象。</p>
      <hr>
      <h2>下载资源</h2>
      <p><strong>软件安装包</strong>（第三方网盘分享，本站不存储、不提供文件）：</p>
      <p>
        <a href="https://1840196271.share.123pan.cn/123pan/v9fWTd-hebdh" target="_blank" rel="noopener" style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 14px;text-decoration:none">下载 CASS 10.1.6 安装包（123 云盘 · 1.46 GB）</a>
      </p>
      <p>提取码：<span class="warn">不在站内展示</span>，请向站长获取（微信：Y18725560542）。｜下载需<strong>注册并登录 123 云盘账号</strong>，建议用<strong>官方客户端</strong>下载（流量按 50% 计、支持断点续传）。</p>
      <p>下方为配套的使用说明原件，可直接下载：</p>
      <p>
        <a href="downloads/software/cass10-guide-original.zip" download style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 0;text-decoration:none">下载《CASS10.1.6 使用说明》原件（TXT · 1 KB）</a>
      </p>
      <p>解压密码（全部文件通用）：<span class="warn">不在站内展示</span>，请向站长获取（微信：Y18725560542）。</p>
      <p>说明原件为 zip 压缩包，Windows 资源管理器可直接解压（解压时输入上方密码）。</p>
      <p><strong>解压说明</strong>：网盘下载的安装包为 RAR 压缩包，需用 WinRAR / 7-Zip / 360压缩 等解压软件解压（Windows 自带解压不支持 RAR），解压后得到 <code>CASS10.1.6</code> 文件夹，按上方步骤安装激活。</p>
    `
  },
  {
    title: "AutoCAD 2016（64位）安装激活教程",
    category: "软件资源",
    summary: "AutoCAD 2016（64位）完整安装包下载与图文安装激活教程：解压安装 → 接受协议 → 输入序列号密钥 → 运行注册机 Patch/Generate 计算激活码，十一步完成安装激活。",
    date: "2026-09-17",
    tags: ["AutoCAD"],
    cover: "assets/tagpics/cad2016-card.jpg?v=20260917b",
    content: `
      <div class="callout"><strong>安装必读</strong>：认真按照本教程步骤操作，步骤没错都能安装好！如果操作不当或系统出问题装不上，可以联系站长远程协助（远程需收点辛苦费，爽快的来，不喜欢磨叽的）。微信：<code>13738343503</code>（备注：远程）。找站长远程的都可以免费获得一套 CAD 课程！课程详情地址：<a href="https://pan.baidu.com/s/19DtjTpoJdl8TL0I9oxGT1Q" target="_blank">百度网盘链接</a>（提取码<span class="warn">不在站内展示</span>，请向站长获取），每套都是精心准备，教程持续更新中。</div>
      <hr>
      <h2>一、安装 AutoCAD 2016</h2>
      <h3>第 1 步 · 解压软件安装包</h3>
      <p>将下载的 CAD2016 压缩包解压到某个目录，双击文件夹里面的 <code>AutoCAD_2016_Simplified_Chinese_Win_32bit.exe</code> 文件（64 位包对应 x64 文件），程序会开始自动解压。等待一会，再点击「安装」，进入下一步。</p>
      <h3>第 2 步 · 接受许可协议</h3>
      <p>国家和地区选「China」，勾选「我接受」，然后点击「下一步」按钮。</p>
      <h3>第 3 步 · 产品信息界面</h3>
      <p>产品语言选「中文（简体）」，许可类型选「单机」，产品信息选「我有我的产品信息」，序列号填写 <code>666-69696969</code>，产品密钥填写 <code>001H1</code>。</p>
      <h3>第 4 步 · 安装配置界面</h3>
      <p>如图所示的选项有些必选，有些自定义选项，安装路径可以自行指定。</p>
      <h3>第 5 步 · 等待安装完成</h3>
      <p>安装 CAD2016 需要几分钟的时间可以完成，请稍候。之后点击「完成」，完成 CAD2016 的安装。</p>
      <hr>
      <h2>二、激活 AutoCAD 2016</h2>
      <h3>第 6 步 · 启动 CAD2016</h3>
      <p>双击桌面上刚生成的 CAD2016 图标，启动软件。第一次运行会弹出许可界面，点击「我同意」，进入激活界面，再点击「激活」。</p>
      <h3>第 7 步 · 运行注册机</h3>
      <p>在安装时解压出来的文件夹里找到 CAD2016 注册机文件夹并进入。右键 CAD2016 注册机里面的 <code>.exe</code> 文件，选「以管理员身份运行」注册机。<strong>32 位系统运行 32 位的，64 位系统运行 64 位的。</strong></p>
      <h3>第 8 步 · 拷贝申请码</h3>
      <p>复制 CAD2016 激活界面的申请号到注册机 Request 一栏中。</p>
      <h3>第 9 步 · 计算激活码</h3>
      <p>先点击「Patch」，再点击「Generate」，出现「Success」提示框，再点击「确定」。</p>
      <h3>第 10 步 · 粘贴激活码</h3>
      <p>拷贝注册机 Activation 中的激活码到「我具有 autodesk 提供的激活码」中的第一个输入框，后面的会自动填上。好了之后，再点「下一步」。</p>
      <h3>第 11 步 · 成功激活</h3>
      <p>成功激活 CAD2016 的界面弹出来了，说明 CAD2016 激活成功，各位可以使用了。如有问题可以联系站长，或按上方安装必读申请远程协助。</p>
      <hr>
      <h2>三、下载资源</h2>
      <p><strong>软件安装包</strong>（第三方网盘分享，本站不存储、不提供文件）：</p>
      <p>
        <a href="https://1840196271.share.123pan.cn/123pan/v9fWTd-R4k3h" target="_blank" rel="noopener" style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 0;text-decoration:none">下载 AutoCAD 2016（64位）安装包（123 云盘 · 1.84 GB）</a>
      </p>
      <p>提取码：<span class="warn">不在站内展示</span>，请向站长获取（微信：Y18725560542）。｜下载需<strong>注册并登录 123 云盘账号</strong>，建议用<strong>官方客户端</strong>下载（流量按 50% 计、支持断点续传）。</p>
      <p>下方为配套的安装必读与安装文档原件，可直接下载：</p>
      <p>
        <a href="downloads/software/cad2016-docs-original.zip" download style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 0;text-decoration:none">下载《安装必读 + 安装文档》原件（TXT + PDF · 1.1 MB）</a>
      </p>
      <p>解压密码（全部文件通用）：<span class="warn">不在站内展示</span>，请向站长获取（微信：Y18725560542）。</p>
      <p>说明原件为 zip 压缩包，Windows 资源管理器可直接解压（解压时输入上方密码）。</p>
      <p><strong>解压说明</strong>：用 WinRAR / 7-Zip / 360压缩 等解压软件解压（Windows 自带解压不支持 RAR），解压时输入上方密码，得到 <code>AutoCAD 2016 64位.zip</code> 安装包（无需密码），再将其解压，按上方教程安装。再次提醒：<strong>安装时请断网</strong>。</p>
    `
  },
  {
    title: "OpenCode 使用教程（零基础版）",
    category: "知识文档",
    summary: "从零上手 OpenCode AI 编程代理：安装配置、常用指令、C/C++ 开发环境搭建、VSCode 配合、编译调试全流程与实战案例。",
    date: "2026-09-17",
    tags: ["OpenCode", "AI编程", "教程", "入门"],
    cover: "assets/tagpics/opencode-card.jpg?v=20260917",
    content: `
      <div class="callout">📌 本教程整理自《OpenCode 的使用教程 · 零基础版》（比特就业课），从零基础带你上手 <strong>OpenCode</strong> 开源 AI 编程代理，并使用 OpenCode + VSCode + w64devkit 搭建一套 <strong>C/C++ 开发环境</strong>。文中操作均配有详细截图，可下载文末原件对照查看。</div>
      <hr>
      <h2>一、OpenCode 是什么</h2>
      <p>OpenCode 是一个<strong>开源 AI 编程代理</strong>（编程助手 / 编程智能体），提供终端界面、桌面应用、网页端和 IDE 扩展等多种使用方式，和 Claude Code、Cline、Gemini CLI 是同一类工具。中文文档：<code>https://opencode.ai/docs/zh-cn</code>。</p>
      <p>编程代理通过内部配置的大语言模型理解自然语言，帮我们完成程序开发的辅助工作，比如：</p>
      <ul>
        <li><strong>代码阅读与理解</strong>——分析代码库结构、理解代码逻辑</li>
        <li><strong>编写和修改代码</strong>——添加功能、修复 bug、重构代码</li>
        <li><strong>搜索与定位</strong>——在大型代码库中快速找到相关文件和代码</li>
        <li><strong>执行命令</strong>——运行 git、npm、python、gcc 等开发工具</li>
        <li><strong>调试问题</strong>——定位问题根源并提供修复方案</li>
        <li><strong>代码审查</strong>——检查代码质量、提出改进建议</li>
        <li><strong>项目探索</strong>——了解陌生项目的架构和依赖</li>
      </ul>
      <p>OpenCode 内置免费模型，也可以连接任意提供商的模型，包括 MiniMax、GLM、Claude、GPT、Gemini 等。</p>
      <h2>二、为什么选 OpenCode</h2>
      <ul>
        <li><strong>开源</strong>，不需要科学上网，普通人就能使用</li>
        <li>默认支持 <strong>LSP（语言服务器协议）</strong>，终端上的代码有语法高亮</li>
        <li>提供<strong>免费模型</strong>接入，使用成本低</li>
        <li>自由切换模型，支持 <strong>75+ 模型</strong></li>
        <li>学会 OpenCode 后可以轻松上手 Claude Code 等其他编程代理</li>
      </ul>
      <p class="warn">整个教程需要安装 4 个软件：Node.js、OpenCode、w64devkit、VSCode。</p>
      <hr>
      <h2>三、安装 Node.js</h2>
      <h3>第 1 步 · 官网下载</h3>
      <p>打开官网下载地址：<code>https://nodejs.org/zh-cn/download</code>，本教程使用 v24 版本。</p>
      <h3>第 2 步 · 安装</h3>
      <p>双击安装包开始安装，一路 next 即可，中途可自行调整安装路径。</p>
      <h3>第 3 步 · 检查是否安装成功</h3>
      <p>打开终端，输入以下命令检查 node 和 npm 的版本：</p>
      <pre><code>node -v
npm -v</code></pre>
      <p>看到版本号，就说明都安装成功了。</p>
      <h3>第 4 步 · 切换 npm 国内源</h3>
      <p>npm 的下载资源一般在国外，网络不好时下载会很慢甚至无法访问，建议切换国内镜像源：</p>
      <pre><code>npm config set registry https://registry.npmmirror.com</code></pre>
      <p>执行后将安装源切换为国内淘宝镜像服务器，速度比国外官方快很多。</p>
      <hr>
      <h2>四、安装 OpenCode</h2>
      <p>OpenCode 官网：<code>https://opencode.ai/zh</code>。它有终端界面、桌面应用、网页端及 IDE 扩展，<strong>推荐使用终端界面</strong>，可以单独使用，也可以嵌入各种 IDE 和编辑器。</p>
      <h3>第 1 步 · 安装</h3>
      <p>终端界面安装命令：</p>
      <pre><code>npm i -g opencode-ai</code></pre>
      <h3>第 2 步 · 验证</h3>
      <pre><code>opencode -v</code></pre>
      <p>看到版本号说明安装成功。</p>
      <h3>第 3 步 · 启动</h3>
      <p>在终端中输入 <code>opencode</code> 就能启动 OpenCode 终端界面。可以随便问一句测试，比如：<code>你现在使用的是什么模型？</code></p>
      <hr>
      <h2>五、常用指令</h2>
      <h3>启动与退出</h3>
      <pre><code>opencode                # 直接启动，默认操作终端当前所在路径
opencode /path/to/project   # 指定工作目录启动
/exit                   # 退出（别名 /quit、/q）</code></pre>
      <p>建议的打开顺序：先在电脑上找到合适的路径 → 在当前路径下打开终端 → 在终端启动 opencode。</p>
      <h3>切换模型 /connect</h3>
      <pre><code>/models                 # 列出可用模型，可切换当前模型
/connect                # 列出支持的模型供应商，按需设置</code></pre>
      <p>比如选择 MiniMax Coding Plan（一个月 29 元，tokens 基本够用），也可以选免费的 MiniMax M2.5 Free 版本。要注意选对国内的服务入口。</p>
      <h3>切换工作模式（Tab 键）</h3>
      <p>Plan 和 Build 是 OpenCode 的两个主 agent，按 <strong>Tab</strong> 即可切换：</p>
      <ul>
        <li><strong>Plan Agent（规划代理）</strong>：只读模式，用于安全地分析和探索代码库；专注需求分析和计划制定；执行敏感操作前会请求许可。适合探索学习陌生代码库、项目规划与技术方案设计。</li>
        <li><strong>Build Agent（构建代理）</strong>：拥有完全的系统访问权限，专为编码、调试和测试设计；根据 Plan 制定的计划生成代码、调试优化、修复错误。适合日常开发任务。</li>
      </ul>
      <p>这种"先规划、再执行"的设计保证了开发流程的规范性和代码质量。可以分别在两种模式下测试：<code>帮我写一个针对整型数组的冒泡排序的代码</code></p>
      <h3>初始化项目 /init</h3>
      <pre><code>/init</code></pre>
      <p>第一次执行 <code>/init</code> 会扫描工作目录下的项目及所有内容，了解项目用途、结构、代码规范、项目类型等，并生成 <code>AGENTS.md</code> 文件；已有该文件时会在其基础上补充。</p>
      <p><strong>AGENTS.md 的作用</strong>：保存项目上下文（结构、构建命令、测试命令等）、帮助 AI 快速上手（新会话无需重复说明）、定义项目规范（代码风格、命名约定、错误处理等）。</p>
      <p>我们还可以在里面加入自定义的行为约定，比如：定义 AI 的角色定位（如"C/C++ 程序员"）、约束代码风格（注释规范、大括号格式）、规定交互原则（确认后再执行、删除前需确认）。</p>
      <p>AGENTS.md 支持两个位置：<strong>项目级</strong>（放在项目根目录，仅该目录生效）和<strong>全局级</strong>（放在 <code>~/.config/opencode/AGENTS.md</code>，对所有会话生效，OpenCode 启动时自动加载）。</p>
      <h3>会话管理</h3>
      <pre><code>/new                    # 开始新的会话
/sessions               # 列出历史会话并切换</code></pre>
      <p>多轮交流后上下文可能影响新的交流，用 <code>/new</code> 开启新会话即可。</p>
      <h3>文件引用与 bash 命令</h3>
      <pre><code>@文件名                 # 引用文件，模糊搜索并自动读取内容
!命令                   # 以 ! 开头的消息作为 shell 命令执行，如 !ls -la</code></pre>
      <p><code>@</code> 引用的用途：①第一次给 opencode 复杂描述时输入不方便，可以把需求写到文档里再 @ 这个文件执行；②让 opencode 学习工作目录下的其他文件；③从文档中提取重要信息。</p>
      <h3>卸载与其他</h3>
      <pre><code>opencode uninstall      # 卸载并删除所有相关文件，选择 Yes 即可
/undo                   # 撤销修改
/redo                   # 重做修改
/share                  # 生成当前对话的链接并复制到剪贴板
/theme                  # 切换主题</code></pre>
      <hr>
      <h2>六、一键搭建 C/C++ 开发环境（Skill 方式）</h2>
      <p>教程作者写了一个 <code>install_w64devkit_skill.md</code> 文件，让 opencode 按照文件中的提示词执行，就可以<strong>一键下载 C/C++ 开发工具包，配置好 gcc/gdb 开发环境并配置环境变量</strong>。</p>
      <h3>第 1 步 · 准备目录</h3>
      <p>比如想安装到 <code>D:\dev</code>，就先创建该文件夹；然后在文件夹中右键鼠标打开终端。</p>
      <h3>第 2 步 · 启动并选模型</h3>
      <p>在终端输入 <code>opencode</code> 启动，输入 <code>/models</code> 把模型切换为 MiniMax M2.5 Free（也可切换为收费模型，效果一般更好）。</p>
      <h3>第 3 步 · 执行 Skill</h3>
      <p>把教程提供的 skill 文件放到 <code>D:\dev</code> 路径下，然后在 opencode 中输入：</p>
      <pre><code>@install_w64devkit_skill.md 按照这个skill的内容，帮我搭建C/C++开发环境</code></pre>
      <p>回车后配置开始：规划任务步骤 → 选择/输入安装路径 → 下载安装包 → 解压安装包 → 验证 gcc 正常工作 → 添加环境变量 → 完成总结。</p>
      <h3>第 4 步 · 自行验证</h3>
      <p>新打开一个终端：</p>
      <pre><code>gcc -v                  # 查看 gcc 版本
which gcc               # 查看 gcc 所在位置</code></pre>
      <hr>
      <h2>七、手动配置 C/C++ 环境（可选）</h2>
      <p class="warn">第 6 章执行成功的话，可以跳过本章。</p>
      <h3>1. 下载 w64devkit</h3>
      <p>w64devkit 是 Windows x64/x86 的开发工具包，包含 9 个工具：mingw-w64 GCC（编译器/链接器/汇编器）、GDB（调试器）、GNU Make、CMake with Ninja、busybox-w32、Vim、Universal Ctags、Ccache。下载链接：<code>https://github.com/skeeto/w64devkit/releases</code>（需要科学上网）。</p>
      <h3>2. 安装</h3>
      <p>双击安装包，选择安装路径（如 <code>D:\dev</code>），点击 Extract 提取，看到解压完成界面即安装结束。</p>
      <h3>3. 配置环境变量</h3>
      <p>【开始】菜单搜索"环境变量" →【编辑系统环境变量】→【环境变量】→ 在当前用户的变量中找到 <code>Path</code> 双击 →【新建】→ 输入 bin 文件夹的路径（根据你的安装路径填写）→ 确定。打开<strong>新的</strong>终端窗口，输入 <code>gcc -v</code> 验证。</p>
      <hr>
      <h2>八、安装 VSCode</h2>
      <p>官网：<code>https://code.visualstudio.com</code>。下载后双击安装，同意协议后一路"下一步"。第一次打开是英文界面，汉化方法：左边栏【扩展】中搜索 chinese，安装简体中文插件，按提示重启后即变成中文界面。</p>
      <hr>
      <h2>九、VSCode + OpenCode 写代码</h2>
      <h3>第 1 步 · 打开工作目录</h3>
      <p>比如想在 <code>D:\dev\code</code> 路径下写代码，就新建 code 文件夹，进入后右键打开终端，输入 <code>code .</code> 用 VSCode 打开该文件夹（弹出提示选择"是，我信任此作者"）。</p>
      <h3>第 2 步 · 在 VSCode 中启动 opencode</h3>
      <p>按 <strong>Ctrl + 反引号键</strong>（Tab 键上方）打开 VSCode 内置终端，输入 <code>opencode</code> 回车启动。</p>
      <h3>第 3 步 · 让 opencode 写代码</h3>
      <pre><code>写一个C语言的程序，对10个元素的整型数组初始化为1~10，然后逆序打印数组内容，加上适当的注释，帮我理解代码</code></pre>
      <hr>
      <h2>十、自动生成编译和调试配置文件</h2>
      <p>VSCode 编译调试 C 代码需要先安装官方 <strong>C/C++ 插件</strong>（扩展中搜索安装即可）。写完代码后，让 opencode 自动生成配置文件：</p>
      <pre><code>我需要对当前的C语言程序进行编译和调试，帮我生成VSCode的配置文件</code></pre>
      <p class="warn">一定要强调是 VSCode 的配置文件，否则 AI 有可能生成 makefile 之类的其他方案。</p>
      <p>生成的调试配置 launch.json 大致如下（gdb 路径按你自己的安装位置调整）：</p>
      <pre><code>{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "C/C++: gcc.exe 生成和调试活动",
            "type": "cppdbg",
            "request": "launch",
            "program": "\${workspaceFolder}\\\${fileBasenameNoExtension}.exe",
            "args": [],
            "stopAtEntry": false,
            "cwd": "\${workspaceFolder}",
            "environment": [],
            "externalConsole": false,
            "MIMode": "gdb",
            "miDebuggerPath": "D:\\dev\\w64devkit\\bin\\gdb.exe",
            "setupCommands": [
                {
                    "description": "为 gdb 启用整齐打印",
                    "text": "-enable-pretty-printing",
                    "ignoreFailures": true
                }
            ],
            "preLaunchTask": "C/C++: gcc.exe 生成活动文件"
        }
    ]
}</code></pre>
      <p>同时还会生成配套的编译任务配置 <code>tasks.json</code>（两者均由 opencode 自动生成，无需手写，完整内容见原件 PDF）。</p>
      <hr>
      <h2>十一、编译与运行</h2>
      <p>点中 <code>.c</code> 文件，在【终端】菜单中选择【运行生成任务】，就会按配置文件编译代码并生成可执行程序。然后在终端运行：</p>
      <pre><code>./array_reverse.exe</code></pre>
      <p><code>.</code> 表示当前目录，<code>./array_reverse.exe</code> 表示当前目录下的 array_reverse.exe 文件。</p>
      <h3>乱码问题处理</h3>
      <p>乱码本质：代码编码方式和终端编码方式不统一。VSCode 默认 UTF-8，终端是 GBK。解决办法：打开【设置】，把文件编码方式改成 <strong>GBK</strong>（以后新建的文件都会用 GBK 编码）；当前文件还要单独处理：点击右下角编码 →【通过编码重新打开】→ 选 GBK；修改后再乱码就按 Ctrl+Z 撤回并保存，重新编译即可。</p>
      <hr>
      <h2>十二、调试代码</h2>
      <p>在代码中点击行号左侧<strong>打断点</strong>，然后到左边栏【调试】栏启动调试。可以在调试中<strong>查看变量</strong>；想查看内存需要安装 2 个插件：<strong>Hex Editor</strong> 和 <strong>MemoryView</strong>。</p>
      <hr>
      <h2>十三、实战案例</h2>
      <h3>案例 1 · 学生信息排序</h3>
      <p>按需求文档让 opencode 完成学生信息排序程序，完整需求文档（学生信息排序需求文档.md）见原件。</p>
      <h3>案例 2 · 复刻扫雷游戏</h3>
      <pre><code>我想复刻一个windows版本的经典扫雷游戏。
在Plan模式下，先规划，再来具体实现。</code></pre>
      <p>先规划、再实现，体会 Plan / Build 两种模式配合的工作流。</p>
      <hr>
      <h2>十四、下载原件</h2>
      <p>本教程的完整 PDF 原件（含全部操作截图与配套文件说明）打包供个人学习使用：</p>
      <p>
        <a href="downloads/knowledge/opencode-tutorial.zip" download style="display:inline-block;padding:10px 22px;background:var(--accent);color:#fff;border-radius:8px;margin:4px 0;text-decoration:none">下载《OpenCode 使用教程》原件（PDF · 约 8.4 MB）</a>
      </p>
      <p><strong>解压说明</strong>：原件为普通压缩包，未设密码，下载后用 Windows 资源管理器或解压软件直接解压即可。</p>
    `
  },
  {
    title: "关于本站",
    category: "关于",
    summary: "这是一个受密码保护的个人教学文档库，收录教学讲义与学习资料。",
    date: "2026-09-16",
    tags: ["本站"],
    content: `
      <h2>关于本站</h2>
      <p>这是一个个人教学文档库，用于整理和分享教学讲义、学习资料与知识笔记。</p>
      <h2>访问说明</h2>
      <ul>
        <li>本站内容受密码保护，需向管理员获取访问密码</li>
        <li>支持按关键词搜索文档</li>
        <li>支持通过右侧标签云按标签筛选</li>
        <li>右上角可切换明亮 / 暗黑主题</li>
      </ul>
      <h2>联系管理员</h2>
      <p>如需获取访问密码、资源解压密码或反馈问题，请联系站长。<strong>微信：Y18725560542</strong></p>
      <h2>版权与免责声明</h2>
      <div class="callout">本站所有内容（含文档、图片、软件安装包等）均收集自互联网，仅供个人学习交流使用，请勿用于任何商业用途，请于下载后 <strong>24 小时内删除</strong>。本站<strong>不制作、不修改、不存储</strong>任何软件安装包，<strong>站内不提供任何软件文件下载</strong>，软件资源均以<strong>第三方网盘分享链接</strong>的形式提供；本站不对内容的准确性作任何保证，亦不承担因使用本站内容而产生的任何直接或间接损失。本站尊重每一位权利人的合法权益，无意侵权；如本站内容侵犯了您的合法权益，请联系站长（微信：<strong>Y18725560542</strong>），我们将在收到通知后<strong>第一时间删除</strong>相关内容。</div>
      <p>完整条款与投诉流程请见独立页面：<a href="legal.html#disclaimer">免责声明</a> · <a href="legal.html#complaint">侵权投诉指引</a></p>
    `
  },
  {
    title: "示例：如何使用本教学文档库",
    category: "主页",
    summary: "这是一篇示例文档，演示如何添加和管理你的教学文档内容。",
    date: "2026-09-16",
    tags: ["教程", "入门"],
    content: `
      <h2>欢迎使用教学文档库</h2>
      <p>这是一篇示例文档，展示了文档库的完整能力。你可以直接编辑 <code>docs.js</code> 文件来增删改查内容。</p>
      <h2>如何添加新文档</h2>
      <ol>
        <li>打开 <code>docs.js</code> 文件</li>
        <li>复制一个文档对象（用 <code>{...}</code> 包裹的那段）</li>
        <li>修改标题、分类、摘要、日期、标签和正文内容</li>
        <li>保存并重新部署即可生效</li>
      </ol>
      <h2>支持的内容格式</h2>
      <ul>
        <li><strong>标题</strong>：使用 <code>&lt;h2&gt;</code>、<code>&lt;h3&gt;</code> 标签</li>
        <li><strong>段落</strong>：使用 <code>&lt;p&gt;</code> 标签</li>
        <li><strong>列表</strong>：使用 <code>&lt;ul&gt;</code> 或 <code>&lt;ol&gt;</code></li>
        <li><strong>代码块</strong>：使用 <code>&lt;pre&gt;&lt;code&gt;</code></li>
      </ul>
      <h2>修改访问密码</h2>
      <p>在 <code>app.js</code> 文件顶部找到 <code>PASSWORD_HASH</code>，替换成你新密码的 SHA-256 哈希值即可。</p>
    `
  },
  {
    title: "示例：Markdown 快速入门",
    category: "主页",
    summary: "一篇示例教学文档，演示 Markdown 语法的基本用法。",
    date: "2026-09-16",
    tags: ["Markdown", "写作"],
    content: `
      <h2>什么是 Markdown</h2>
      <p>Markdown 是一种轻量级标记语言，用简单的符号就能写出格式化的文档，广泛用于笔记、博客和文档编写。</p>
      <h2>常用语法</h2>
      <h3>标题</h3>
      <pre><code># 一级标题
## 二级标题
### 三级标题</code></pre>
      <h3>列表</h3>
      <pre><code>- 无序列表项
- 无序列表项
1. 有序列表项
2. 有序列表项</code></pre>
      <h3>链接与图片</h3>
      <pre><code>[链接文字](https://example.com)
![图片描述](https://example.com/image.png)</code></pre>
      <h2>总结</h2>
      <p>掌握这几个基础语法，你就能写出绝大多数文档了。</p>
    `
  }
];
