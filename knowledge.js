// ===== 知识文档 · 同页全屏层（门 → 卡片墙 → 沉浸阅读）=====
// 2026-09-20 新建。知识文档与旅游攻略共用同一套「全屏门 + 卡片墙」的视觉语言与交互
//（复用 .gatewall / .stagewall / .tcard / .detailview 等共享 class），但逻辑独立在本文件，
// 由 index.html 在 app.js 之后引入。
// 依赖 app.js 里已定义的全局工具：sha256 / WALL_HASHES / isDocWallUnlocked /
// setDocWallUnlocked / makeSimplex3D / escapeHtml / getDocCover / cleanTags / buildToc /
// isDocVisible / switchCategory。

// ---------- 1. 门的背景动效：学院风「水墨」（**不复用** app.js 的蓝族波纹）----------
// 2026-09-20 二次升级 → **第八轮做减法**（用户：「删除不必要的漂浮墨迹、金色弧线和零散装饰；
//   降低背景装饰存在感，让中央猫头鹰和信封成为唯一视觉中心；减少"网页特效感"」）。
//   **现在还留着的就三件**：
//     ① **底色墨晕**：5 团墨（墨绿/鎏金/淡墨）缓慢漂移、呼吸涨落 —— 低频、大片、不成形；
//        它给纸一张「旧纸的深浅」，而不是「纸上飘着的东西」
//     ② **跟手墨晕**：鼠标处一团柔和墨晕缓动跟随，离开即淡出
//     ③ **签名羽毛笔**：停在一处慢慢写一个签名（约 5s），写完停留 → 笔抬起 → 墨迹淡去
//   **第八轮删掉的五件**（都是「一眼看出是网页特效」的那类）：
//     ✗ 墨滴的**定时飘落**（约 2s 一滴、落点随机）—— 用户截图里把它读成「中央的破洞/阴影」
//     ✗ **描金藤蔓**（四角轮转卷出的金色弧线 ＋ 沿途小叶）
//     ✗ **描金流光**（沿证书内框绕行的那道金色光带）
//     ✗ **星尘**（定点闪烁的四芒星）
//     ✗ **浮尘**（缓缓上浮的金/墨小点）
//     ⚠️ 只有「墨滴」是**改来源**而不是全删：定时飘落删了，**点击仍落一小滴淡墨**；
//        另外四件是整块删除，**别再顺手加回来**。
// ⚠️ canvas 已改为**透明**：纸底由 CSS `.gatewall` 给、书卷插画由 `.gdeco` 给。
//    所以 DOM 里 `.gdeco` **必须排在 canvas 之前**，墨才会画在插画之上。
// ⚠️ 性能：所有软边元素都走「预渲染贴图 + drawImage」；每帧只留 1～2 个 createRadialGradient。
// ⚠️ 合成模式一律 source-over（不用 multiply）：透明画布上 multiply 的行为不直观。
var knowledgeWave = (function () {
  var cv = null, ctx = null, noise = null, raf = 0, running = false;
  var W = 0, H = 0, nt = 0, ready = false, k = 1;          // k = 画布像素 / CSS 像素
  var REDUCE = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var MAXW = 1440;
  var paper = null;                      // 预渲染的纸颗粒层
  var sprites = {};                      // 软边贴图缓存
  var blooms = [];                       // 墨滴（第八轮起**只由点击产生**）
  var mx = -9999, my = -9999, ax = -9999, ay = -9999, aura = 0;

  var INK_C = [36, 80, 68];              // 墨绿（2026-09-20 加深：#2f5d50 在暖纸上偏灰）
  var GOLD_C = [162, 122, 46];           // 鎏金（加深）
  var GREY_C = [74, 66, 54];             // 淡墨（暖褐灰；原来是偏蓝的灰，压在暖纸上发脏）
  // 点击落墨用的**更淡一档**（第八轮）：原来点击/拖尾都用 INK_C，落在纸上是一块黑斑，
  // 用户把那一类东西读成「破洞/阴影」。改淡之后点一下只是「纸上洇开一小团淡痕」。
  var INK_SOFT_C = [98, 130, 118];

  // 底色墨团：c=基色 / a=峰值不透明度 / x,y=基准位置(比例) / r=半径系数 / s=漂移速度 / p=呼吸幅度
  var INK = [
    { c: INK_C, a: .34, x: .20, y: .28, r: .42, s: 1.0, p: .18 },
    { c: GOLD_C, a: .28, x: .78, y: .36, r: .34, s: 1.25, p: .15 },
    { c: GREY_C, a: .23, x: .50, y: .74, r: .48, s: 0.8, p: .20 },
    { c: INK_C, a: .23, x: .10, y: .80, r: .34, s: 1.45, p: .14 },
    { c: GOLD_C, a: .20, x: .88, y: .80, r: .30, s: 1.1, p: .16 }
  ];

  // ⚠️ 贴图一律用**固定基准半径**（CANON），需要多大就 drawImage 缩放到多大。
  //    绝不能用"变化的半径"当缓存键 —— 墨团的呼吸每帧都变半径，那样会缓存出上百张
  //    大贴图（每张数百 KB），内存直接爆掉。
  function sprite(key, rgb, canon) {
    var id = key;
    if (sprites[id]) return sprites[id];
    var c = document.createElement("canvas");
    c.width = c.height = canon * 2;
    var g = c.getContext("2d");
    var gd = g.createRadialGradient(canon, canon, 0, canon, canon, canon);
    var s = rgb[0] + "," + rgb[1] + "," + rgb[2];
    gd.addColorStop(0, "rgba(" + s + ",1)");
    gd.addColorStop(.42, "rgba(" + s + ",.5)");
    gd.addColorStop(1, "rgba(" + s + ",0)");
    g.fillStyle = gd;
    g.fillRect(0, 0, canon * 2, canon * 2);
    sprites[id] = c;
    return c;
  }
  var CANON = 256;

  // 纸颗粒：预渲染成一张贴图（原来是每帧画近千个 fillRect，最贵的一块）
  function buildPaper() {
    paper = document.createElement("canvas");
    paper.width = W; paper.height = H;
    var g = paper.getContext("2d");
    var n = Math.min(1100, Math.round(W * H / 3400));
    for (var i = 0; i < n; i++) {
      g.globalAlpha = Math.random() * .05 + .012;
      g.fillStyle = Math.random() < .35 ? "#b9a887" : "#7a705c";
      var s = Math.random() * .7 + .35;
      g.fillRect(Math.random() * W, Math.random() * H, s, s);
    }
    g.globalAlpha = 1;
  }

  // ---- 墨滴绽放 ----
  function spawnBloom(x, y, rad, color) {
    var m = 8 + Math.round(Math.random() * 6), tend = [];
    for (var i = 0; i < m; i++) {
      tend.push({
        a: i / m * 6.2832 + Math.random() * .5,
        // 墨丝：别抽太长太直，否则一朵墨花会变成"海胆/病毒"（已踩过）——
        // 长度收到 0.55~1.9 倍半径，弯度加大，读作"渗进纸纤维"而不是"放射线"
        l: (.55 + Math.random() * 1.35) * rad,
        w: .6 + Math.random() * 1.2,
        cv: (Math.random() - .5) * 1.9
      });
    }
    blooms.push({ x: x, y: y, rad: rad, c: color, t: 0, seed: Math.random() * 900, tend: tend });
    if (blooms.length > 5) blooms.shift();
  }

  function drawBloom(b) {
    var t = b.t;
    // 生命曲线：0～.12 落墨（实心点）→ .12～.62 晕开到最盛 → .62～1 淡去
    var life = t < .12 ? t / .12 : (t < .62 ? 1 : 1 - (t - .62) / .38);
    if (life <= 0) return;
    var grow = t < .12 ? .34 + .66 * (t / .12) : 1 + .34 * Math.min(1, (t - .12) / .5);
    var rad = b.rad * grow;
    var cs = b.c[0] + "," + b.c[1] + "," + b.c[2];

    // 不规则的墨缘：用角度映射到噪声（首尾天然闭合），两个倍频叠加 ——
    // 低频给"整体形状歪掉"，高频给"边缘被纸纤维咬出的毛边"。
    // 半径先算进数组：下面的「墨面」与「扩散环」共用同一组半径 —— 省钱，且环的形状与墨缘一致。
    var seg = 64, i, a, wob = .22 + .12 * Math.sin(t * 6.2832), rs = [];
    for (i = 0; i <= seg; i++) {
      a = i / seg * 6.2832;
      var ca = Math.cos(a), sa = Math.sin(a);
      rs.push(rad * (1
        + noise(b.seed + ca * 1.05, b.seed + sa * 1.05, nt * .0016) * wob
        + noise(b.seed * 1.7 + ca * 2.9, b.seed * 1.7 + sa * 2.9, nt * .0011) * .12));
    }
    function ringPath(scale) {
      ctx.beginPath();
      for (var j = 0; j <= seg; j++) {
        var aj = j / seg * 6.2832, rj = (j === seg ? rs[0] : rs[j]) * scale;
        var px = b.x + Math.cos(aj) * rj, py = b.y + Math.sin(aj) * rj;
        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }
    ringPath(1);
    // ⚠️ 渐变要"中间淡、靠边浓"（湿边）—— 初版是中心最浓，截图上像一坨灰球。
    //    真实的墨晕是纸把水吸走、色素堆在边界，所以峰值放在 .90 而不是 0。
    //    ⚠️ 内圈还要**足够淡**：大半径 + 内圈偏浓 = 一块"淡绿气球"（已踩过），
    //    所以 0→.70 段压得很低，只让边界那圈显形。
    var gd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, rad);
    gd.addColorStop(0, "rgba(" + cs + "," + (.06 * life) + ")");
    gd.addColorStop(.32, "rgba(" + cs + "," + (.075 * life) + ")");
    gd.addColorStop(.70, "rgba(" + cs + "," + (.135 * life) + ")");
    gd.addColorStop(.90, "rgba(" + cs + "," + (.40 * life) + ")");   // 湿边
    gd.addColorStop(1, "rgba(" + cs + ",0)");
    ctx.fillStyle = gd;
    ctx.fill();

    // 扩散环：墨落下后向外推的两圈水痕（只在前半程出现，形状跟着墨缘走）
    if (t > .10 && t < .62) {
      for (var rg = 0; rg < 2; rg++) {
        var rt = (t - .10 - rg * .11) / .42;
        if (rt <= 0 || rt >= 1) continue;
        ctx.strokeStyle = "rgba(" + cs + "," + (.24 * (1 - rt) * life) + ")";
        ctx.lineWidth = 1.3;
        ringPath(1 + rt * (.55 + rg * .45));
        ctx.stroke();
      }
    }

    // 墨丝：从墨心沿纸纤维抽出，越到后面越淡
    if (t < .78) {
      var len = Math.min(1, t / .5), fad = 1 - Math.max(0, (t - .3) / .48);
      ctx.lineCap = "round";
      for (i = 0; i < b.tend.length; i++) {
        var tn = b.tend[i], L = tn.l * len;
        var x0 = b.x + Math.cos(tn.a) * b.rad * .18, y0 = b.y + Math.sin(tn.a) * b.rad * .18;
        var x1 = b.x + Math.cos(tn.a) * L, y1 = b.y + Math.sin(tn.a) * L;
        var qx = b.x + Math.cos(tn.a + tn.cv) * L * .6, qy = b.y + Math.sin(tn.a + tn.cv) * L * .6;
        ctx.strokeStyle = "rgba(" + cs + "," + (.28 * fad * len) + ")";
        ctx.lineWidth = tn.w;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(qx, qy, x1, y1);
        ctx.stroke();
      }
    }

    // 墨心：刚落下那一下的实心点（别太重，否则像"糊了一坨"）
    if (t < .26) {
      var core = Math.max(6, b.rad * (.14 + .18 * (1 - t / .26)));
      ctx.globalAlpha = .45 * (1 - t / .26);
      ctx.drawImage(sprite("core" + cs, b.c, 64), b.x - core, b.y - core, core * 2, core * 2);
      ctx.globalAlpha = 1;
    }
  }

  // ---- 魔法学院小物：签名羽毛笔 / 飘浮蜡烛 / 星尘 ----
  // 2026-09-20 演变：漂浮的线描猫头鹰 → 用户"换个别的" → 横穿画面的羽毛笔（笔尖拖一条淡墨线）
  //   → 用户"动的太快了，而且最好是签名，不是画简单直线" → 改成现在的**在空中写签名**：
  //     羽毛笔停在一处，沿一条连笔带圈的手写路径**慢慢写完**（约 6.3s），墨迹随笔画生长，
  //     写完停留一下、笔提起来淡去。猫头鹰没丢：栖在信封上沿（index.html 的 `.perchowl`）
  //     + 邮戳正中的猫头鹰印记。
  // ⚠️ 只做**通用的魔法学院意象**，不复刻任何影视作品的美术、徽标或字体（版权）。
  //
  // ⚠️ 签名路径是拿 Python+PIL 迭代出来的（`.workbuddy/tmp/sign_try3.py`）：
  //    **相邻两段的切线不连续就会出现"针尖"折角**（第二版就是这样，渲染出来像界面上的杂线）。
  //    改控制点之前先拿那个脚本渲染一眼再动。
  var SIGN_START = [34, 78];
  var SIGN_SEGS = [
    [20, 58,  20, 28,  42, 20],     // 1 起笔上挑
    [62, 12,  76, 30,  59, 44],     // 2 顶部回环（折返回左下 → 第一个圈）
    [48, 53,  38, 58,  34, 70],     // 3 落回基线
    [32, 50,  44, 44,  54, 64],     // 4 第一拱（矮）
    [62, 80,  74, 72,  82, 54],     // 5 谷更深 → 第二拱（高）
    [90, 36, 106, 40, 112, 60],     // 6 第三拱（高、宽）
    [118, 76, 130, 78, 136, 62],    // 7 第四拱（正中）
    [140, 50, 136, 44, 126, 46],    // 8 折返 → 中段小圈的上半
    [116, 48, 112, 58, 118, 66],    // 9 小圈的下半（与 8 交叉成圈）
    [126, 74, 138, 76, 148, 62],    // 10 出圈后接一个拱
    [158, 46, 172, 42, 180, 58],    // 11 第五拱（高）
    [188, 72, 206, 96, 232, 92],    // 12 下垂尾
    [252, 88, 258, 62, 244, 50],    // 13 尾端回勾（垂圈）
    [232, 40, 250, 30, 276, 32],    // 14 向右甩出
    [300, 34, 314, 50, 312, 66],    // 15 收尾下压
    [310, 80, 280, 92, 236, 94],    // 16 长横回扫
    [180, 96, 120, 98,  78, 92]     // 17 继续回扫
  ];
  var SIGN_BOX = [330, 118];        // 路径外接盒（换算缩放用）
  // 写完用多少帧（60fps 标定 → 300 帧 ≈ 5.0s）。
  // ⚠️ 2026-09-20 用户第三次调档："太慢了，滴落2秒，签字5秒" → 390 → **300 帧（5s）**。
  //    前两轮之所以反复调不准，是因为动效按**帧**计数而 rAF 频率=屏幕刷新率（高刷屏快一倍），
  //    真正的修法是 loop() 里的「攒够 16.667ms 才推进一帧」（把节奏锁在 60fps），见文末 loop()。
  //    ⚠️ 有归一之后，这里的帧数才真的等于"秒 × 60"。
  var SIGN_WRITE = 300;
  var SIGN_HOLD = 70, SIGN_FADE = 62;

  // 采样成折线 + 累计弧长（盒坐标；缩放/旋转都留到绘制时算）
  var SIGN = (function () {
    var pts = [SIGN_START.slice()], cum = [0], total = 0, i, j, s, t, mt;
    for (i = 0; i < SIGN_SEGS.length; i++) {
      s = SIGN_SEGS[i];
      for (j = 1; j <= 22; j++) {
        t = j / 22; mt = 1 - t;
        var a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, d = t * t * t;
        var p0 = pts[pts.length - 1];
        pts.push([
          a * p0[0] + b * s[0] + c * s[2] + d * s[4],
          a * p0[1] + b * s[1] + c * s[3] + d * s[5]
        ]);
      }
    }
    for (i = 1; i < pts.length; i++) {
      var dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
      total += Math.sqrt(dx * dx + dy * dy);
      cum.push(total);
    }
    return { pts: pts, cum: cum, len: total };
  })();

  var signatures = [];
  var signGap = 0;

  function spawnSign() {
    // 位置：让开中间那块「信封 ＋ 信纸」——只走上方那条带，左右随机。
    // ⚠️ 下界必须**量**出来、不能写死百分比：信纸抽出来后它的顶边正好落在 `.mail` 的顶边
    //    （`--openY` 就是按这个反推的），写死的话窄屏/矮屏上签名会被信纸盖掉半截
    //    （canvas 在 `.gstage` 之下，被盖住就是整段看不见）。过冲还会再往上探 ~15px，所以留 12px 余量。
    var y0 = H * .06, limit = H * .30;
    var m = document.getElementById("knMail");
    if (m) limit = Math.min(limit, m.getBoundingClientRect().top * (H / Math.max(1, window.innerHeight)) - 12);
    var avail = Math.max(46, limit - y0);
    // 宽度三重上限取小：屏宽 28% / 300px / 由这条带的高度反推出来的宽度
    var bw = Math.min(W * .28, 300, avail / .358) * (.86 + Math.random() * .28);
    var k = bw / SIGN_BOX[0];
    if (SIGN_BOX[1] * k > avail) k = avail / SIGN_BOX[1];     // 带子太矮就整体缩一档
    var bh = SIGN_BOX[1] * k;
    signatures.push({
      ox: W * .05 + Math.random() * Math.max(0, W * .90 - bw),
      oy: y0 + Math.random() * Math.max(0, avail - bh),
      k: k, rot: (Math.random() * 2 - 1) * .05,
      t: 0, pi: 0, ink: []
    });
    if (signatures.length > 1) signatures.shift();
  }

  // 盒坐标 → 世界坐标（绕盒原点轻微旋转，像随手签上去的）
  function signToWorld(sg, bx, by) {
    var c = Math.cos(sg.rot), s = Math.sin(sg.rot);
    var x = bx * sg.k, y = by * sg.k;
    return [sg.ox + x * c - y * s, sg.oy + x * s + y * c];
  }

  // 墨迹折线（世界坐标）——两层：① 洇开的一层浅晕 ② 笔迹主体
  function inkStroke(ink, w, style) {
    ctx.strokeStyle = style;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(ink[0][0], ink[0][1]);
    for (var i = 1; i < ink.length; i++) ctx.lineTo(ink[i][0], ink[i][1]);
    ctx.stroke();
  }

  // 羽毛笔：笔尖落在 (x, y)；tilt=0 时羽毛竖直向上，越大越向右倾（像握笔）
  function drawQuillAt(x, y, tilt, s, a) {
    var L = s * 2.7, cs = "36,80,68";
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt);
    ctx.translate(0, -L * .62);                // 让笔尖（局部 y=+L*.62）落到原点
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(1, s * .05);
    ctx.fillStyle = "rgba(" + cs + "," + (a * .16) + ")";
    ctx.strokeStyle = "rgba(" + cs + "," + a + ")";
    ctx.beginPath();                           // 羽片（叶形）
    ctx.moveTo(0, L * .44);
    ctx.quadraticCurveTo(-L * .36, L * .02, -L * .075, -L * .58);
    ctx.quadraticCurveTo(-L * .02, -L * .68, 0, -L * .68);
    ctx.quadraticCurveTo(L * .02, -L * .68, L * .075, -L * .58);
    ctx.quadraticCurveTo(L * .36, L * .02, 0, L * .44);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();                           // 羽轴
    ctx.moveTo(0, L * .46);
    ctx.lineTo(0, -L * .66);
    ctx.stroke();
    ctx.strokeStyle = "rgba(" + cs + "," + (a * .45) + ")";
    ctx.lineWidth = Math.max(.7, s * .03);
    ctx.beginPath();                           // 羽枝（越靠笔尖越短）
    for (var i = 0; i < 8; i++) {
      var ty = -L * .5 + i * L * .12;
      var wd = L * .26 * (1 - Math.abs(i - 2.6) / 4.6);
      if (wd < 0) continue;
      ctx.moveTo(0, ty); ctx.lineTo(-wd, ty + L * .06);
      ctx.moveTo(0, ty); ctx.lineTo(wd, ty + L * .06);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(" + cs + "," + (a * .9) + ")";
    ctx.beginPath();                           // 笔尖
    ctx.moveTo(-s * .07, L * .44);
    ctx.lineTo(s * .07, L * .44);
    ctx.lineTo(0, L * .62);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 每帧：推进笔画 → 画墨迹 → 画笔（写完笔抬起淡出）
  function drawSign(sg, s) {
    var cum = SIGN.cum, p = SIGN.pts;
    var prog = sg.t / SIGN_WRITE;
    if (prog > 1) prog = 1;
    // 手写节奏：起笔与收笔略慢（easeInOutQuad），中段快
    var e = prog < .5 ? 2 * prog * prog : 1 - Math.pow(2 - 2 * prog, 2) / 2;
    var L = e * SIGN.len;
    while (sg.pi < cum.length - 1 && cum[sg.pi + 1] <= L) sg.pi++;
    var i0 = sg.pi, i1 = Math.min(i0 + 1, p.length - 1);
    var seg = cum[i1] - cum[i0];
    var f = seg > 0 ? (L - cum[i0]) / seg : 0;
    if (f > 1) f = 1;
    var wx = signToWorld(sg, p[i0][0] + (p[i1][0] - p[i0][0]) * f,
                             p[i0][1] + (p[i1][1] - p[i0][1]) * f);

    var writing = sg.t <= SIGN_WRITE;
    var alpha = 1;
    if (sg.t > SIGN_WRITE + SIGN_HOLD)
      alpha = Math.max(0, 1 - (sg.t - SIGN_WRITE - SIGN_HOLD) / SIGN_FADE);

    // 记墨：只在"写"的阶段推进（点密到 0.7px 才收一个，写完就定住）
    if (writing) {
      var last = sg.ink[sg.ink.length - 1];
      if (!last || Math.abs(wx[0] - last[0]) + Math.abs(wx[1] - last[1]) > .7)
        sg.ink.push([wx[0], wx[1]]);
    }

    if (sg.ink.length > 1 && alpha > .01) {
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      inkStroke(sg.ink, Math.max(2.6, s * .2), "rgba(36,80,68," + (.085 * alpha) + ")");    // 洇
      inkStroke(sg.ink, Math.max(1.15, s * .058), "rgba(28,62,52," + (.34 * alpha) + ")");  // 笔迹
    }

    // 笔：写完就抬起来淡出（像真的写完把笔提走）
    var penA = 1;
    if (sg.t > SIGN_WRITE) {
      var lift = Math.min(1, (sg.t - SIGN_WRITE) / 30);
      penA = 1 - lift;
      wx = [wx[0] + lift * 26, wx[1] - lift * 32];
    }
    if (penA > .01) drawQuillAt(wx[0], wx[1], .58 + Math.sin(sg.t * .02) * .06, s, .62 * penA);
  }

  // 飘浮蜡烛已删（2026-09-20 用户："漂浮的蜡烛删掉，要素太嘈杂了"）

  // （原来的 drawDust 金尘已随猫头鹰一起去掉，墨线在 step 里直接描）

  // ---- 鼠标：只保留一团跟手墨晕 ----
  // 第八轮删掉「快速移动时拖出细小墨花」（用户：「删除不必要的漂浮墨迹」「减少网页特效感」）。
  function onMove(e) {
    if (!cv) return;
    mx = e.clientX * k; my = e.clientY * k;
  }
  // 点击落墨：这是**唯一的墨滴来源**（定时飘落已删）。由用户触发 → 不会自己乱跑。
  // ⚠️ 半径 .07 → **.045**、颜色换成 INK_SOFT_C：点一下是「纸上洇开一小团淡痕」，
  //    而不是原来那种「纸上一块黑斑」（用户把后者读成「破洞/阴影」）。
  function onDown(e) {
    if (!cv || REDUCE) return;
    spawnBloom(e.clientX * k, e.clientY * k, Math.min(W, H) * .045, INK_SOFT_C);
  }

  function setup() {
    if (ready) return true;
    cv = document.getElementById("knowledgeGateWave");
    if (!cv) return false;
    ctx = cv.getContext("2d");
    if (!ctx) return false;
    noise = makeSimplex3D();
    var gate = document.getElementById("knowledgeGate");
    if (gate && !gate.__knWave) {
      gate.__knWave = true;
      gate.addEventListener("pointermove", onMove, { passive: true });
      gate.addEventListener("pointerdown", onDown, { passive: true });
    }
    ready = true;
    window.addEventListener("resize", function () {
      if (!cv) return;
      size();
      if (REDUCE) step();
    });
    return true;
  }

  function size() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var scale = Math.min(1, MAXW / Math.max(1, vw));
    W = cv.width = Math.max(1, Math.round(vw * scale));
    H = cv.height = Math.max(1, Math.round(vh * scale));
    cv.style.width = vw + "px";
    cv.style.height = vh + "px";
    k = W / Math.max(1, vw);
    buildPaper();                        // 尺寸变了 → 颗粒贴图重做
  }

  function step() {
    ctx.clearRect(0, 0, W, H);
    nt += 1;

    if (paper) ctx.drawImage(paper, 0, 0);

    // ① 底色墨晕：位置随噪声漂移、半径呼吸式涨落
    for (var i = 0; i < INK.length; i++) {
      var b = INK[i], t = nt * .0018 * b.s;
      var x = (b.x + noise(i * 5.1 + 1.7, 0.3, t) * .10) * W;
      var y = (b.y + noise(i * 5.1 + 8.3, 1.1, t) * .09) * H;
      var rad = Math.max(20, b.r * Math.min(W, H) * (1 + noise(i * 5.1 + 3.9, 2.7, t * .8) * b.p));
      ctx.globalAlpha = b.a;
      ctx.drawImage(sprite("w" + i, b.c, CANON), x - rad, y - rad, rad * 2, rad * 2);
    }
    ctx.globalAlpha = 1;

    // ④ 跟手墨晕（缓动跟随，鼠标离开后淡出）
    if (mx > -999) { ax += (mx - ax) * .08; ay += (my - ay) * .08; aura = Math.min(1, aura + .05); }
    else aura = Math.max(0, aura - .04);
    if (aura > .01) {
      var ar = Math.min(W, H) * .17;
      ctx.globalAlpha = .5 * aura;
      ctx.drawImage(sprite("aura", INK_C, CANON), ax - ar, ay - ar, ar * 2, ar * 2);
      ctx.globalAlpha = 1;
    }

    // ② 墨滴（**只画点击产生的那几滴**；定时飘落第八轮已删，见文件头「删掉的五件」）
    for (var m = blooms.length - 1; m >= 0; m--) {
      var bl = blooms[m];
      // 单滴生命周期 3.6s（bl.t 驱动绽放、扩散环、墨丝一起走）
      bl.t += .0046;
      if (bl.t >= 1) { blooms.splice(m, 1); continue; }
      drawBloom(bl);
    }
    // 签名羽毛笔：停在一处慢慢写完一个签名（约 5s），写完停留 → 笔抬起 → 墨迹淡去
    signGap++;
    if (signGap > 150) { signGap = 0; if (!signatures.length) spawnSign(); }
    var quillS = Math.min(W, H) * .04;
    for (var gi = signatures.length - 1; gi >= 0; gi--) {
      var sg2 = signatures[gi];
      sg2.t++;
      if (sg2.t > SIGN_WRITE + SIGN_HOLD + SIGN_FADE) { signatures.splice(gi, 1); continue; }
      drawSign(sg2, quillS);
    }
  }

  // ⚠️⚠️ 帧率归一（2026-09-20）：本文件**所有节奏参数都是"按 60fps 标定的帧数"**
  // 注释里的「秒」全部是 **60fps 标定值**（签名 300 帧 ≈ 5s、墨滴 bl.t 的步进……）。
  //    而 `requestAnimationFrame` 的回调频率 = **屏幕刷新率**：60Hz 屏每秒 60 次、
  //    120Hz 屏每秒 120 次、144Hz 每秒 144 次 —— 帧数完全不变，**时间却被成倍压缩**。
  //    这就是用户两次说"太快了"的**真凶**（60fps 下 6.3s 的签名，在 120Hz 上是 3.2s）。
  //    解法：**攒够 16.667ms 才推进一帧** —— 无论屏幕刷新率多少，节奏都锁死在 60fps。
  //    （不逐项乘 dt 系数，是因为那样要改十几处增量、还会把各动画的相位关系搞乱；
  //     锁 60fps 则 `step()` 与全部常量一字不动。）
  //    ⚠️ 别退化成"跳帧不管时间"：`accMs` 只在**攒够一整帧**时扣减，且扣减后立刻取模，
  //       这样画面卡顿一次也不会在之后"瞬移"补播。低刷屏（＜60Hz）则每帧都满足条件、行为同旧版。
  var accMs = 0, lastTs = 0;
  function loop(ts) {
    var now = ts || (window.performance && performance.now ? performance.now() : Date.now());
    if (!lastTs) { lastTs = now; raf = requestAnimationFrame(loop); return; }
    accMs += now - lastTs;
    lastTs = now;
    if (accMs >= 16.667) {
      accMs %= 16.667;                     // 只留不足一帧的余量（不累积、不补播）
      step();
    }
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (!setup()) return;
    size();
    blooms = [];
    signatures = []; signGap = 130;   // 第一个签名约 2s 后开始写
    mx = my = ax = ay = -9999; aura = 0;
    accMs = 0; lastTs = 0;                 // 帧率归一的累加器也要归零（否则重开门会带上一轮的余量）
    // ⚠️ 第八轮删掉了「开门第一拍先落一滴墨」—— 定时的那一滴与开场那一滴都是「漂浮墨迹」，
    //    门一露面纸上就有个黑点，正是用户嫌的那种。现在开场只有纸、墨晕与签名。
    if (REDUCE) {                          // 尊重「减少动效」：只画一帧静态底纹
      nt = 40;
      step();
      return;
    }
    if (running) return;
    running = true;
    nt = 0;
    loop();
  }
  function stop() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }
  // 给回归用：签名/羽毛笔的当前状态。回归里靠它钉"羽毛笔是在**写签名**、不是横穿画直线"，
  // 光看截图分不清"没画"和"画得太淡"，所以必须能读到内部计数。
  function signState() {
    var s = signatures[0];
    return {
      n: signatures.length,
      t: s ? Math.round(s.t) : -1,
      ink: s ? s.ink.length : 0,      // 已落下的墨点个数（随笔画增长）
      segs: SIGN_SEGS.length,         // 路径由多少段贝塞尔拼成（直线只要 1 段）
      len: Math.round(SIGN.len)       // 折线总长（盒坐标）
    };
  }

  return { start: start, stop: stop, sign: signState };
})();

// ---------- 1. 回归口 ----------
// 只有回归断言会调它（test_site.py）。放在这里是为了让断言能读到"签名写到哪了"，
// 否则"羽毛笔在写签名"这件事在截图上看不出来（可能只是墨太淡）。
function knSignState() {
  return knowledgeWave && knowledgeWave.sign ? knowledgeWave.sign() : null;
}

// ---------- 2. 门逻辑 ----------
function setKnowledgeGateUnlocked(on) {
  var g = document.getElementById("knowledgeGate");
  var en = document.getElementById("knowledgeGateEnter");
  if (g) {
    g.classList.toggle("unlocked", !!on);
    if (on) { g.classList.remove("ok"); void g.offsetWidth; g.classList.add("ok"); }
    else { g.classList.remove("ok"); }
  }
  if (en) en.hidden = !on;
  if (en) {
    if (on) {
      en.classList.add("genter-quiet");
      var dropQuiet = function () { en.classList.remove("genter-quiet"); };
      setTimeout(function () {
        document.addEventListener("keydown", dropQuiet, { once: true });
      }, 0);
    } else {
      en.classList.remove("genter-quiet");
    }
  }
}

function enterKnowledgeGate() {
  var g = document.getElementById("knowledgeGate");
  if (!g || g.classList.contains("leaving")) return;
  g.classList.add("leaving");
  document.body.style.overflow = "";
  switchCategory("知识文档", document.querySelector('#mainNav a[data-cat="知识文档"]'));
  setTimeout(function () {
    g.hidden = true;
    g.classList.remove("leaving", "enter", "ok", "wrong");
    knowledgeWave.stop();
  }, 430);
}

function showKnowledgeGate() {
  var g = document.getElementById("knowledgeGate");
  if (!g) return;
  var err = document.getElementById("knowledgeGateErr");
  if (err) err.textContent = "";
  var inp = document.getElementById("knowledgeGatePwd");
  if (inp) inp.value = "";
  setKnowledgeGateUnlocked(false);
  // 每次开门都从"信封合着"起手：先清掉 open / 动画态，再强制回流后加 open，
  // 否则 transition 不会从闭合态开始播（`.open` 会一次性把封口翻开 + 把信纸抽出来）。
  g.classList.remove("enter", "leaving", "ok", "wrong", "open");
  g.hidden = false;
  void g.offsetWidth;
  g.classList.add("enter");
  void g.offsetWidth;
  g.classList.add("open");                 // 封口翻起 →（延时）信纸抽出
  document.body.style.overflow = "hidden";
  knowledgeWave.start();
  setTimeout(function () { if (inp) inp.focus(); }, 1480);   // 等信纸抽到位再落焦点
}

function tryKnowledgeUnlock() {
  var inp = document.getElementById("knowledgeGatePwd");
  var err = document.getElementById("knowledgeGateErr");
  var g = document.getElementById("knowledgeGate");
  var pwd = inp ? inp.value.trim() : "";
  pwd = pwd.replace(/[\uFF01-\uFF5E]/g, function (ch) {
    return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
  });
  if (!pwd) {
    if (err) err.textContent = "请输入密码";
    shakeKnowledgeGate(g);
    return;
  }
  if (sha256(pwd) === WALL_HASHES["知识文档"]) {
    setDocWallUnlocked("知识文档");
    setKnowledgeGateUnlocked(true);
    if (err) err.textContent = "";
    var en = document.getElementById("knowledgeGateEnter");
    if (en) setTimeout(function () { en.focus(); }, 620);
    return;
  }
  if (err) err.textContent = "密码错误，请重试";
  if (inp) { inp.value = ""; inp.focus(); }
  shakeKnowledgeGate(g);
}

function shakeKnowledgeGate(g) {
  if (!g) return;
  g.classList.remove("wrong");
  void g.offsetWidth;
  g.classList.add("wrong");
  setTimeout(function () { g.classList.remove("wrong"); }, 460);
}

// ---------- 3. 舞台逻辑 ----------
// 门户时钟（仿灵澄岛「陪伴时间」），15s 级联新，仅在门户可见时跑
var _knClock = null;
function knPortalTick() {
  var t = document.getElementById("knTime");
  if (!t) return;
  var d = new Date();
  var h = d.getHours(), ap = h >= 12 ? "PM" : "AM";
  var h12 = h % 12 || 12;
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  t.innerHTML = p2(h12) + ":" + p2(d.getMinutes()) + " <small>" + ap + "</small>";
  var dd = document.getElementById("knDate");
  if (dd) {
    var wk = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][d.getDay()];
    dd.textContent = d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()) + " · " + wk;
  }
}
function knPortalClock(on) {
  if (on) {
    knPortalTick();
    if (_knClock) clearInterval(_knClock);
    _knClock = setInterval(knPortalTick, 15000);
  } else {
    if (_knClock) { clearInterval(_knClock); _knClock = null; }
  }
}

// 分类（书架）→ 该分类下的文档：按文档的 `shelf` 字段分组
//（shelf 取值与 index.html 里条目的 data-shelf 对应：rule / tech / humanities / misc）
function knShelfDocs(shelf) {
  return knowledgeDocs().filter(function (d) { return (d.shelf || "") === shelf; });
}

// 按分类同步门户条目状态：该分类下有文档 → 启用；无 → 禁用（灰化）。
// 新增文档后条目自动启用，不必手改 HTML（HTML 里只写 data-shelf 与文案）。
function knSyncPortal() {
  var items = document.querySelectorAll("#knowledgeHome .pt-item");
  [].forEach.call(items, function (it) {
    var shelf = it.getAttribute("data-shelf") || "";
    if (knShelfDocs(shelf).length) it.removeAttribute("disabled");
    else it.setAttribute("disabled", "disabled");
  });
}

// 门户条目 → 打开该分类的第一篇（该分类暂无文档时条目已禁用，走不到这里）
function knOpenShelf(shelf) {
  var list = knShelfDocs(shelf);
  if (list.length) openKnowledge(list[0]);
}

// 「随机一读」：从知识库里随机翻一篇（只有一篇时就是它）—— 替代原来名不副实的「听书台」
//（那个只是打开右下角音乐播放器，与"听书"无关；播放器本身在右下角随时可点）。
function knRandomRead() {
  var docs = knowledgeDocs();
  if (!docs.length) return;
  openKnowledge(docs[Math.floor(Math.random() * docs.length)]);
}

function openKnowledgeStage() {
  var st = document.getElementById("knowledgeStage");
  if (!st) return;
  st.hidden = false;
  st.classList.add("kn-home-on");      // 顶栏切学院风浅色（门户是纸底，深色顶栏会像黑横条）
  document.body.style.overflow = "hidden";
  var kd = document.getElementById("knowledgeDetail");
  if (kd) kd.style.display = "none";
  var kh = document.getElementById("knowledgeHome");
  if (kh) { kh.hidden = false; kh.scrollTop = 0; }
  var dl = document.getElementById("docList");
  if (dl) dl.style.display = "none";
  // 顶栏统计 + 条目启用/禁用（按知识库实际篇数）
  var stat = document.getElementById("knStats");
  if (stat) {
    var n = knowledgeDocs().length;
    stat.innerHTML =
      "<span>ENTRIES <b>" + String(n).padStart(3, "0") + "</b></span>" +
      "<span>BASE <b>KB</b></span>";
  }
  knSyncPortal();
  knPortalClock(true);
}

function closeKnowledgeStage() {
  var st = document.getElementById("knowledgeStage");
  if (st) { st.hidden = true; st.classList.remove("kn-home-on"); }
  document.body.style.overflow = "";
  knPortalClock(false);
}

// 回到门户首页（从沉浸阅读返回 / ESC）
function knBackToHome() {
  var kd = document.getElementById("knowledgeDetail");
  if (kd) kd.style.display = "none";
  var kh = document.getElementById("knowledgeHome");
  if (kh) kh.hidden = false;
  var st = document.getElementById("knowledgeStage");
  if (st) st.classList.add("kn-home-on");   // 顶栏回学院风浅色
  knPortalClock(true);
}

// ---------- 4. 知识文档列表 ----------
function knowledgeDocs() {
  return (window.DOCS || []).filter(function (d) {
    return d.category === "知识文档" && isDocVisible(d);
  });
}

// ---------- 5. 沉浸阅读详情 ----------
function openKnowledge(d) {
  var kh = document.getElementById("knowledgeHome");
  if (kh) kh.hidden = true;
  var st = document.getElementById("knowledgeStage");
  if (st) st.classList.remove("kn-home-on");   // 阅读页是深底，顶栏切回深色
  knPortalClock(false);
  var kd = document.getElementById("knowledgeDetail");
  kd.style.display = "";
  document.getElementById("knTitle").textContent = d.title;
  document.getElementById("knMeta").textContent = (d.date || "") + "  ·  知识文档";
  document.getElementById("knBody").innerHTML = d.content || "<p>暂无内容</p>";
  buildToc("knBody", "knToc");
  kd.scrollTop = 0;
}

// ---------- 6. 事件绑定 ----------
(function bindKnowledge() {
  var ex = document.getElementById("knowledgeExit");
  var gok = document.getElementById("knowledgeGateOk");
  var gp = document.getElementById("knowledgeGatePwd");
  var ge = document.getElementById("knowledgeGateEnter");
  var kb = document.getElementById("knowledgeBack");
  var kh = document.getElementById("knowledgeHome");

  if (ex) ex.addEventListener("click", function () {
    closeKnowledgeStage();
    var home = document.querySelector('#mainNav a[data-cat="主页"]');
    if (home) home.click();
  });
  if (kb) kb.addEventListener("click", knBackToHome);

  // 门户点击：书目条目 → 打开该分类第一篇；「随机一读」→ 随机翻一篇
  if (kh) kh.addEventListener("click", function (e) {
    if (e.target.closest("#knRandom")) { knRandomRead(); return; }
    var item = e.target.closest(".pt-item");
    if (item) { knOpenShelf(item.getAttribute("data-shelf") || ""); }
  });

  if (gok) gok.addEventListener("click", tryKnowledgeUnlock);
  if (gp) gp.addEventListener("keydown", function (e) { if (e.key === "Enter") tryKnowledgeUnlock(); });
  if (ge) ge.addEventListener("click", enterKnowledgeGate);

  // ESC：先关知识文档门/舞台（与 app.js 里旅游攻略的 ESC 处理并列，互不干扰）
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var g = document.getElementById("knowledgeGate");
    if (g && !g.hidden) {
      g.hidden = true;
      g.classList.remove("enter", "leaving", "ok", "wrong");
      knowledgeWave.stop();
      document.body.style.overflow = "";
      return;
    }
    var st = document.getElementById("knowledgeStage");
    if (st && !st.hidden) {
      var kd = document.getElementById("knowledgeDetail");
      if (kd && kd.style.display !== "none") {
        // 详情内 ESC = 回到门户首页
        knBackToHome();
      } else if (ex) {
        ex.click();
      }
    }
  });
})();
