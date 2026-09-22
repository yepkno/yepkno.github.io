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
//   **现在还留着的就四件**：
//     ① **底色墨晕**：5 团墨（墨绿/鎏金/淡墨）缓慢漂移、呼吸涨落 —— 低频、大片、不成形；
//        它给纸一张「旧纸的深浅」，而不是「纸上飘着的东西」
//     ② **墨滴**：≈1.6s 一滴，落点走外围环带（避开正中那封信与输入行），
//        边缘按 simplex 噪声不规则晕开并抽墨丝 —— **第九轮恢复**（见下）
//     ③ **跟手墨晕**：鼠标处一团柔和墨晕缓动跟随、离开即淡出；`pointerdown` 也落一小滴
//     ④ **签名羽毛笔**：停在一处慢慢写一个签名（约 5s），写完停留 → 笔抬起 → 墨迹淡去
//   ⚠️⚠️ **第九轮用户："这个界面墨滴的特效就消失了"** —— 第八轮把"定时飘落"整条删掉，
//      用户立刻发现。这次**恢复但收小调淡**：半径 `.045~.10 → .030~.055`、
//      主色换成更淡的 `INK_SOFT_C` / `GREY_C`（原来用 `INK_C`，落纸就是一块黑斑 ——
//      用户上一轮正是把它读成「中央的破洞/阴影」）。**别再调回"大而深"**。
//   ⚠️ **第八轮删掉的另外四件仍然不许回来**：描金藤蔓 / 描金流光 / 星尘 / 浮尘。
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
  var blooms = [];                       // 墨滴（定时飘落 ＋ 点击落墨）
  var bloomGap = 0;                      // 距上一滴的帧数（60fps 标定）
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

    // ② 墨滴（第九轮恢复定时飘落；**收小调淡**的理由见文件头）
    bloomGap++;
    if (bloomGap > 96) {                  // ≈1.6s 一滴（60fps 标定）
      bloomGap = 0;
      // 落点走"外围环带"（避开正中那封信与输入行），也避开上下两条纸色带
      var ang = Math.random() * 6.2832, rr = .16 + Math.random() * .18;
      var bx = W * (.5 + Math.cos(ang) * rr * 1.6);
      var by = H * (.5 + Math.sin(ang) * rr);
      var roll = Math.random();
      spawnBloom(bx, by, Math.min(W, H) * (.030 + Math.random() * .025),
                 roll < .12 ? GOLD_C : (roll < .52 ? INK_SOFT_C : GREY_C));
    }
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
    blooms = []; bloomGap = 40;      // 开门后约 0.9s 落第一滴（不等满 96 帧）
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
  // ⚠️ 墨迹 canvas **延后一拍**再起（2026-09-20 批一）：它自己要 setup/size/画头几帧，
  //    与"门露脸 ＋ 四只鸟起飞"挤在同一帧里会互相拖 —— 实测帧间隔尖峰就落在这一拍。
  //    延 60ms 内眼看不出来（墨是氛围），却把这段主线程开销让到了飞入动画之前。
  setTimeout(function () { knowledgeWave.start(); }, 60);
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
// ---------- 4.5 分类空间（2026-09-21 批十七）----------
// 门户四个条目 → 各自进一个**有自己性格的房间**（用户："每个入口 ui 展示都要符合特色"）：
//   rule        魔法图书馆**大厅**：推门而入，正前方前台、左右各一道环梯、大厅里有学生
//   tech        **蓝**（冷静 / 客观 / 缜密：直角、网格、等宽编号）
//   humanities  **红**（关怀 / 博爱 / 哲思：圆角、衬线、暖晕）
//   archive     图书馆**书架区**（暖褐 ＋ 档案卡：编号与年份像真卷宗）
// ⚠️ 四套主题只靠 `data-shelf` 切 CSS 变量，DOM 骨架共用 —— 加分类只写一段主题 CSS ＋ 一条 META。
// ⚠️ 页面文案在这里（META），不写进 HTML —— 用户要改措辞只动这一处。
var KN_SHELF_META = {
  rule: {
    eyebrow: "Annual Curriculum · 年度修习",
    tag: "PLAN",
    title: "年度修习",
    sub: "推开这扇门就是大厅：正前方是前台，左手右手各有一道环梯盘旋而上，来借书的人两两结伴从两侧走过。今年的修习都登在前台那本簿子上 —— 打算学的、正在读的、和已经搁下的。",
    foot: "从两侧的环梯可以上到二层书架 —— 那几排还在整理，暂时不对外开放。"
  },
  tech: {
    eyebrow: "Technical Library · 技术文库",
    tag: "TECH · 01",
    title: "技术文库",
    sub: "工程实践类的整理：AI 编程、GIS 制图、Python 与开发环境配置。这里只回答「怎么做」，所以尽量给能照着走一遍的步骤。",
    foot: "本区偏工程实践；涉及版本与接口的内容，以你手上工具的官方文档为准。"
  },
  humanities: {
    eyebrow: "Humanities Library · 人文文库",
    tag: "HUMANITIES · 02",
    title: "人文文库",
    sub: "这里放的是关于「怎么看待」的文章：阅读、历史、社会与自我。它们不下结论，只提供一种角度。",
    foot: "本区的文章适合被反复重读 —— 这是它和技术文档最大的不同。"
  },
  archive: {
    eyebrow: "Originals · 馆藏原件",
    tag: "ARCHIVE · 03",
    title: "馆藏原件",
    sub: "文库的底稿都在这一格：完整版、配图版、可下载的文档摘录。它们保留着原始的面貌，正文页里被裁掉的细节都在这里。",
    foot: "原件均为文档；软件类资源不在本站存储，具体见站点免责声明。"
  }
};
var knShelfList = [];   // 当前分类的文档（列表项按序号取用）

// 门户条目 → 打开该分类的「分类空间」（结构缺失时退回旧行为：直接开第一篇）
// ══════════════════════════════════════════════════════════════════════════
// 「年度修习」＝ **学院大厅**（用户 2026-09-21 重设方向；数据仍在 study-plan.js）
//   ⭐ 设计原则（用户原话）：**计划由我制定，修习由我完成，年度只负责记录。**
//   ⚠️ 于是页面上**没有**：本月该学什么 / 今日任务 / 逾期 / 连续打卡 / 剩余天数；
//      也没有"完成度 %"。时间只在「轨迹」里出现，而且只负责**记录**，不是计划表。
//   ⚠️ 14 个阶段按方向归成 4 间「修习室」（依次相扣）；点开一间 → 右侧落下一份档案。
//   ⚠️ 楼梯上不放任何 UI —— 上一版把 14 级挂在环梯上，被用户判定"太丑"并推翻。
// ══════════════════════════════════════════════════════════════════════════
var KST_KEY = "study_steps_v1";

var KST_GROUPS = [
  { key: "AI 与智能", en: "AI & Intelligence", n: [1, 5],
    aim: "建立 AI 应用的底层认知，直到能把工具真正接进自己的系统。" },
  { key: "编程基础", en: "Programming", n: [6, 9],
    aim: "两门主力语言与界面框架 —— 够读、够改、够调试 AI 写出来的东西。" },
  { key: "GIS 与 CAD", en: "GIS & CAD", n: [10, 13],
    aim: "把专业能力和编程接起来，做成能用的插件与独立工具。" },
  { key: "整合实践", en: "Integration", n: [14, 14],
    aim: "把前面所有能力汇成一件可演示、可复现、可维护的东西。" }
];

function kstLit() {
  try {
    var v = parseInt(localStorage.getItem(KST_KEY) || "0", 10);
    return (isNaN(v) || v < 0) ? 0 : Math.min(v, 14);
  } catch (e) { return 0; }
}

function kstSetLit(n) {
  try { localStorage.setItem(KST_KEY, String(Math.max(0, Math.min(n, 14)))); } catch (e) {}
}

/* ── ④ 全局清单 ＋ ②③ 物料的**自评状态**（2026-09-21 追加）─────────────────
   ⚠️ 与台阶（KST_KEY）互不干扰：台阶答"走到哪一级"，这里答"认了哪几条 / 手边有什么"。
   ⚠️ 纯静态无后端 → 只存在**本机浏览器**，换设备从零开始；它是记录，不是待办工具。 */
var KST_MARK_KEY = "study_marks_v1";   // 清单刻痕：勾过的条目 id
var KST_GEAR_KEY = "study_gear_v1";    // 书 / 软件：已入手、已装好的 id
var kstFilter = "0";   // 清单当前翻到**哪一册**（KST_GROUPS 下标）
/* ⚠️ 刻意没有「全部」：60 条一次铺开要 2666px、必然出滚动条。
      一次看一册（14–17 条）才是一屏放得下的量 —— 也正合"翻阅某本册子"的动作。 */

function kstIds(key) {
  try { return (localStorage.getItem(key) || "").split(",").filter(Boolean); }
  catch (e) { return []; }
}
function kstHas(key, id) { return kstIds(key).indexOf(id) >= 0; }
function kstFlip(key, id) {
  var a = kstIds(key), i = a.indexOf(id);
  if (i < 0) a.push(id); else a.splice(i, 1);
  try { localStorage.setItem(key, a.join(",")); } catch (e) {}
  return i < 0;                        // true = 这一下刚勾上
}
function kstCount(key) { return kstIds(key).length; }

/* ── 大厅的六个入口 → 各自**独立一页**（2026-09-21 用户：
      "不要用滚动条，最好是有分开入口然后弹出独立页面"）─────────────────────
   ⚠️ 每页的容器一次性建出来，再调各自的渲染函数（元素必须先存在）。
   ⚠️ **页内也按"一屏放得下"设计**；`.kspage-c` 的 overflow 只是矮窗时的安全网。 */
var KST_MENU = [
  { k: "plan",    t: "我的学习计划", d: "四个方向依次相扣" },
  { k: "books",   t: "学习资料",     d: "要学的课程、要买的书与搜索关键词" },
  { k: "tools",   t: "工具台",       d: "要装的软件，按三档分" },
  { k: "entries", t: "修习条目",     d: "一册登记簿，可以勾" },
  { k: "trail",   t: "实际修习轨迹", d: "只记录，不安排" },
  { k: "sum",     t: "年度修习录",   d: "这一年留下的" }
];
var KST_PAGES = {
  plan: {
    t: "Learning Plan · 我的学习计划",
    h: '<p class="kst-pg-s">四个方向依次相扣。点开任何一间，可以点亮下一级，' +
       '也可以把误点的退回来 —— 记录是可以改的。</p>' +
       '<div class="kst-map" id="kstMap"></div>',
    r: function () { kstMapRender(); }
  },
  books: {
    t: "Materials · 学习资料",
    h: '<p class="kst-pg-s">表 02 原文照录 —— 课程怎么跟、书要不要买、学到什么程度算够。' +
       '有书要买的那几条，左沿是朱红的；点开还有一条<b>搜索关键词</b>可直接搜。</p>' +
       '<div class="ksgrid" id="kstBooks"></div>',
    r: function () { kstBooksRender(); }
  },
  tools: {
    t: "Toolkit · 工具台",
    h: '<p class="kst-pg-s">表 03 原文照录 —— 按 🟢🟡🔵 三档排，左沿的颜色就是它的装订档位。</p>' +
       '<div id="kstMain"></div><div class="ksgrid" id="kstTools"></div>',
    r: function () { kstToolsRender(); }
  },
  entries: {
    t: "Entries · 修习条目",
    h: '<p class="kst-pg-s">每一条都照录原表 · 勾一条就是留下一道刻痕 —— 不排名、不催促。</p>' +
       '<div class="kst-cf" id="kstCf"></div><p class="kst-tally" id="kstTally"></p>' +
       '<div class="kst-reg ksgrid ksgrid-2" id="kstReg"></div>',
    r: function () { kstRegRender(); }
  },
  trail: {
    t: "Trail · 实际修习轨迹",
    h: '<p class="kst-pg-s" id="kstTrailLede"></p>' +
       '<div class="kst-trail" id="kstTrail"></div>',
    r: function () { kstTrailRender(); }
  },
  sum: {
    t: "Annual Report · 年度修习录",
    h: '<div class="ksta ksta-sum" id="kstSum">' +
       '<span class="ksta-c tl"></span><span class="ksta-c tr"></span>' +
       '<span class="ksta-c bl"></span><span class="ksta-c br"></span>' +
       '<div id="kstSumB"></div></div>',
    r: function () { kstSumRender(); }
  }
};

function kstMenuRender() {
  var box = document.getElementById("kstaMenu");
  if (!box) return;
  box.innerHTML = KST_MENU.map(function (m) {
    return '<button class="ksta-m" type="button" data-p="' + m.k + '"><b>' + m.t +
      "</b><i>" + m.d + "</i></button>";
  }).join("");
}

/* ⚠️⚠️ 入场类名**不能只靠 `requestAnimationFrame`**：headless / 后台标签下 rAF 会被节流、
   甚至完全不跑，那一刻 `.kspage` 停在 `display:none` —— 元素 `hidden=false` 但**高度是 0**，
   于是"一屏放得下"那类断言 `0 <= 0 + 2` **假通过**（2026-09-22 实测踩到）。
   加一个 60ms 的 setTimeout 兜底：rAF 正常时它只是重复 add（无副作用）。 */
function ksOn(el) {
  if (!el) return;
  var add = function () { el.classList.add("on"); };
  requestAnimationFrame(add);
  window.setTimeout(add, 60);
}

function ksPageOpen(key) {
  var p = KST_PAGES[key];
  if (!p) return;
  var box = document.getElementById("ksPage"), c = document.getElementById("ksPageC");
  var t = document.getElementById("ksPageT");
  if (!box || !c) return;
  if (t) t.textContent = p.t;
  c.innerHTML = p.h;
  c.scrollTop = 0;
  box.hidden = false;
  ksOn(box);
  /* 独立页打开 → 把分类空间的「← 回到目录」收走（它和页内的「← 回到大厅」同角，会叠） */
  var sh = document.getElementById("knShelf");
  if (sh) sh.classList.add("ks-page-on");
  p.r();                 // 先建容器、再渲染内容
  kstBind();             // 新元素要重新挂事件
}
function ksPageClose() {
  var box = document.getElementById("ksPage");
  if (!box || box.hidden) return;
  box.classList.remove("on");
  var sh = document.getElementById("knShelf");
  if (sh) sh.classList.remove("ks-page-on");   // 页面开始收 → 「回到目录」就淡回来
  kstFileClose();        // 从"我的学习计划"里点开的档案抽屉一并收走
  window.setTimeout(function () {
    if (box.classList.contains("on")) return;
    box.hidden = true;
    var c = document.getElementById("ksPageC");
    if (c) c.innerHTML = "";
  }, 320);
}
/* 离开这一格时用：**不走动画**，直接复位（整个舞台都在收） */
function ksPageReset() {
  var box = document.getElementById("ksPage");
  if (box) { box.classList.remove("on"); box.hidden = true; }
  var sh = document.getElementById("knShelf");
  if (sh) sh.classList.remove("ks-page-on");
  var c = document.getElementById("ksPageC");
  if (c) c.innerHTML = "";
  ksLeafReset();
}
function ksLeafReset() {
  var b = document.getElementById("ksLeaf");
  if (b) { b.classList.remove("on"); b.hidden = true; }
}

/* 二级：单件详情（一本书 / 一件工具）＝一张浮起的小纸 */
function ksLeafOpen(html) {
  var b = document.getElementById("ksLeaf"), c = document.getElementById("ksLeafB");
  if (!b || !c) return;
  c.innerHTML = html;
  b.hidden = false;
  b.scrollTop = 0;
  ksOn(b);
}
function ksLeafClose() {
  var b = document.getElementById("ksLeaf");
  if (!b || b.hidden) return;
  b.classList.remove("on");
  window.setTimeout(function () { if (!b.classList.contains("on")) b.hidden = true; }, 280);
}

function kstStage(n) {
  var P = window.STUDY_PLAN;
  if (!P) return null;
  for (var i = 0; i < P.stages.length; i++) if (P.stages[i].n === n) return P.stages[i];
  return null;
}

function kstGroupDone(g) {
  var lit = kstLit(), c = 0;
  for (var n = g.n[0]; n <= g.n[1]; n++) if (n <= lit) c++;
  return c;
}
function kstGroupTotal(g) { return g.n[1] - g.n[0] + 1; }
/* ⚠️ 只报"已走过多少"，**不写 n / m 这种分母** —— 与全站"不催促"的口径一致
      （2026-09-22 之前的版本会在修习录里显示"修习中 3 / 5"，那是进度条的语言）。 */
function kstGroupState(g) {
  var d = kstGroupDone(g);
  if (!d) return "未启程";
  return d >= kstGroupTotal(g) ? "已走完" : ("已走过 " + d + " 级");
}

/* 一 · 大厅：前台的小对话条 ＋ 由它呼出的档案纸
   ⚠️ 2026-09-22：**进场不再摆大纸**（用户："不要一进去就保持呼出状态"）——
      默认只看到前台上那张小对话条，点一下才把纸呼出来。 */
function ksPaper(on) {
  var p = document.getElementById("ksta"), d = document.getElementById("ksDesk");
  if (p) p.hidden = !on;      // 从 display:none 转回来时，CSS 的 kstRise 会自己重跑
  if (d) d.hidden = !!on;
}
/* 纸面上那行统计（只报"已走过多少"，**不写 / 14 这种分母**） */
function kstPlaqueRender() {
  var stat = document.getElementById("kstaStat");
  if (!stat) return;
  var lit = kstLit();
  var dirs = KST_GROUPS.filter(function (g) { return kstGroupDone(g) > 0; }).length;
  stat.textContent = "已在修习的方向 · " + String(dirs).padStart(2, "0") +
    "　｜　走过的台阶 · " + String(lit).padStart(2, "0");
}
/* 状态一变（点亮 / 撤回）就要刷这几处。
   ⚠️ **不要**用 `kstRender()` 代替 —— 它末尾有 `ksPaper(false)`，会把大纸收掉。 */
function kstSyncAll() {
  kstPlaqueRender();
  kstMapRender();
  kstTrailRender();
  kstSumRender();
}
function kstRender() {
  var P = window.STUDY_PLAN;
  if (!P) return;
  var lit = kstLit();
  var yr = String(new Date().getFullYear());
  var y = document.getElementById("kstaY");
  if (y) y.textContent = yr;
  var dh = document.getElementById("ksDeskH");
  if (dh) dh.textContent = yr + " · Annual Studia";
  var q = document.getElementById("kstaQ");
  if (q) q.textContent = "不是规定这一年要完成什么，而是记录这一年实际走过的路。";
  kstPlaqueRender();
  kstMenuRender();       // 大厅的六个入口（各自成一页，页内内容在 ksPageOpen 时才渲染）
  kstLawRender();        // ① 法则纸（内容静态，随渲染一起备好）
  ksPaper(false);        // 每次进这一格都是"先进大厅、再自己点开"
  kstBind();
}

/* 二 · 学院总图：四间修习室，依次相扣 */
/* ⚠️ 2026-09-22 用户："学习计划界面太空了" —— 原来每间只有一行。
   现在一张卡带：英文名／级段／这一间要做出什么／走过的**点串**（不走百分比，与台阶同一套语言）
   ／这一路已带上的资料与工具数。 */
function kstMapRender() {
  var box = document.getElementById("kstMap");
  if (!box) return;
  var P = window.STUDY_PLAN || {}, lit = kstLit(), out = "";
  KST_GROUPS.forEach(function (g, i) {
    var done = kstGroupDone(g), last = kstStage(g.n[1]);
    var nC = 0, nT = 0, dots = "";
    for (var k = g.n[0]; k <= g.n[1]; k++) {
      var st = kstStage(k);
      if (k <= lit) {
        nC += (P.courses || []).filter(function (c) { return st && c.stage === st.key; }).length;
        nT += ((P.stageTools || {})[k] || []).length;
      }
      dots += '<u class="' + (k <= lit ? "on" : "") + '"></u>';
    }
    out += '<button class="kst-mk' + (done ? " has" : "") + '" type="button" data-g="' + i + '">' +
      '<span class="kst-mk-no">' + String(i + 1).padStart(2, "0") + "</span>" +
      '<span class="kst-mk-b"><b>' + g.key + "</b><i>" + g.en + "</i></span>" +
      '<span class="kst-mk-st">' + kstGroupState(g) + "</span>" +
      '<span class="kst-mk-r">第 ' + String(g.n[0]).padStart(2, "0") + " – " +
        String(g.n[1]).padStart(2, "0") + " 级 ｜ 要做出：" + (last ? last.out : "") + "</span>" +
      '<span class="kst-mk-d">' + dots +
        (nC ? "<em>" + nC + " 份资料</em>" : "") +
        (nT ? "<em>" + nT + " 件工具</em>" : "") + "</span></button>";
    if (i < KST_GROUPS.length - 1) out += '<span class="kst-mk-u"></span>';
  });
  box.innerHTML = out;
}

/* 三 · 实际修习轨迹 —— 形状呼应大厅里的**两道环梯**：左 01–07 ／ 右 08–14。
   ⚠️ 只记"第 N 步"与产出，**从不带日期**（用户："时间不能成为我的负担"）。
   ⚠️ 未走到的那几级**只露级号与阶段名 ＋ "待走"**，不显示任何要求 ——
      路要看得见，但不给人布置作业（用户早先的设计："尚未抵达＝虚化"）。 */
function kstTrailNode(n, lit) {
  var P = window.STUDY_PLAN, s = kstStage(n);
  if (!s) return "";
  var no = String(n).padStart(2, "0");
  if (n > lit) {
    return '<li class="off"><b><i>' + no + "</i>" + s.key + "</b><em>待走</em></li>";
  }
  var nC = (P.courses || []).filter(function (c) { return c.stage === s.key; }).length;
  var nT = ((P.stageTools || {})[n] || []).length;
  var meta = (nC ? nC + " 份资料" : "") + (nC && nT ? " · " : "") + (nT ? nT + " 件工具" : "");
  return '<li class="on' + (n === lit ? " cur" : "") + '">' +
    '<b><i>' + no + "</i>" + s.key +
      '<button class="kstu" type="button" data-un="' + n + '" title="撤回这一级">&#8617;</button>' +
      "</b>" +
    '<span class="kstn-t">' + s.tech + "</span>" +
    '<em>产出：' + s.out + "</em>" +
    (meta ? '<span class="kstn-m">' + meta + "</span>" : "") + "</li>";
}
function kstTrailRender() {
  var box = document.getElementById("kstTrail");
  if (!box) return;
  var lit = kstLit(), L = "", R = "", n;
  for (n = 1; n <= 7; n++) L += kstTrailNode(n, lit);
  for (n = 8; n <= 14; n++) R += kstTrailNode(n, lit);
  box.innerHTML =
    '<div class="kstw"><p class="kstw-h">左环梯 · 01 – 07</p><ol class="kstw-l">' + L + "</ol></div>" +
    '<div class="kstw"><p class="kstw-h">右环梯 · 08 – 14</p><ol class="kstw-l">' + R + "</ol></div>";
  var lede = document.getElementById("kstTrailLede");
  if (lede) {
    lede.textContent = lit
      ? "下面这 " + lit + " 步是你自己走出来的 —— 不是日程表。"
      : "这条路还一步未走 —— 它不催你。";
  }
}

/* 四 · 年度修习录 —— 一页年度档案：一行数字带 ＋ 四个方向各一段。
   全部由**真实记录**推出来（点亮了几级 / 勾了几道刻痕 / 手边有什么），不掺一句漂亮话。
   ⚠️ 数字只报"已经有了多少"，**没有分母、没有完成度、没有排名**（三道防线）。 */
function kstSumCell(v, label) {
  return '<div class="kstsum-c"><b>' + v + "</b><i>" + label + "</i></div>";
}
function kstSumRender() {
  var P = window.STUDY_PLAN, box = document.getElementById("kstSumB");
  if (!P || !box) return;
  var lit = kstLit(), yr = String(new Date().getFullYear());
  var marks = kstCount(KST_MARK_KEY), gear = kstCount(KST_GEAR_KEY);
  var reached = KST_GROUPS.filter(function (g) { return kstGroupDone(g) > 0; });
  // 空的判据要连清单/物料一起看：只勾了条目、还没点亮台阶时，也算"这一年动过了"。
  var started = lit || marks || gear;
  var head = '<p class="kstsum-y">' + yr + ' · 年度修习录</p>' +
    '<p class="kstsum-q">不是规定这一年要完成什么，而是记录这一年实际走过的路。</p>' +
    '<div class="kstsum-b">' + kstSumCell(lit, "走过的台阶") +
      kstSumCell(reached.length, "修习的方向") +
      kstSumCell(marks, "留下的刻痕") +
      kstSumCell(gear, "手边的书与工具") + "</div>";
  if (!started) {
    box.innerHTML = head + '<p class="kstsum-e">这一年还没有开始记录 —— ' +
      '<em>修习录不催你，它只在你真的走过后才写下第一行。</em></p>';
    return;
  }
  var segs = KST_GROUPS.map(function (g) {
    var done = kstGroupDone(g);
    if (!done) return '<div class="kstsum-s off"><b>' + g.key + "</b><i>未启程</i></div>";
    var last = Math.min(lit, g.n[1]), s = kstStage(last), tools = [];
    for (var k = g.n[0]; k <= last; k++) {
      ((P.stageTools || {})[k] || []).forEach(function (t) {
        if (tools.indexOf(t) < 0) tools.push(t);
      });
    }
    // ⚠️ 工具名里本身含 " / "（如 "DeepSeek / Qwen / GLM / Kimi / Seed"）—— 只举 4 个，
    //    超长的截断，末尾报"另有 N 件"，否则这一行会糊成长长一串读不出（2026-09-22 实测）。
    var tl = tools.slice(0, 4).map(function (t) {
      return t.length > 15 ? t.slice(0, 14) + "…" : t;
    }).join(" · ") + (tools.length > 4 ? "，另有 " + (tools.length - 4) + " 件" : "");
    return '<div class="kstsum-s on"><b>' + g.key + "</b><i>" + kstGroupState(g) + "</i>" +
      '<em>走到「' + (s ? s.key : "") + "」 —— 产出：" + (s ? s.out : "") + "</em>" +
      (tl ? "<u>带上：" + tl + "</u>" : "") + "</div>";
  }).join("");
  box.innerHTML = head + segs +
    '<p class="kstsum-f">『计划可以改变，方向可以调整。修习录只记录最后留下的路径。』</p>';
}

/* ══════════════════════════════════════════════════════════════════════════
   2026-09-21 追加四件（用户选定）：① 法则纸 ② 学习资料 ③ 工具台 ④ 全局清单
   ⚠️ 三道防线：**不出现**剩余条数 / 完成度百分比 / 逾期 / 连续打卡 / "今天该做"。
      勾选＝**记录**（"这一条我认了"），不是欠债；分组只报"已留 N 道"，**绝不报分母**。
   ⚠️ 勾选**不与台阶联动** —— 晋级仍然只能由用户自己按"点亮这一级"。
   ══════════════════════════════════════════════════════════════════════════ */

/* ① 学习理论：一张「法则纸」（题记 ＋ 目标 ＋ 使用方法 ＋ 三条判断规则，不加编号） */
function kstLawRender() {
  var P = window.STUDY_PLAN;
  if (!P || !P.meta) return;
  var set = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = v || ""; };
  set("ksLawQ", P.meta.principle);
  set("ksLawGoal", P.meta.goal);
  set("ksLawHow", P.meta.howto);
  var r = document.getElementById("ksLawRules");
  if (r && P.quick && P.quick.rules) {
    r.innerHTML = P.quick.rules.map(function (x) {
      return '<div class="kslaw-r"><h5>' + x.tag + "</h5><p>" + x.list + "</p></div>";
    }).join("");
  }
}
function kstLawOpen() {
  var b = document.getElementById("ksLaw");
  if (!b) return;
  b.hidden = false;
  requestAnimationFrame(function () { b.classList.add("on"); });
}
function kstLawClose() {
  var b = document.getElementById("ksLaw");
  if (!b || b.hidden) return;
  b.classList.remove("on");
  window.setTimeout(function () { if (!b.classList.contains("on")) b.hidden = true; }, 320);
}

/* ② 学习资料：一页 —— 课程 / 书 / 怎么学 / 学到什么程度（表 02 原文照录） */
function kstLink(u, label) {
  if (!/^https?:/i.test(u || "")) return '<span class="kst-a" style="cursor:default">' + (u || "") + "</span>";
  return '<a class="kst-a" href="' + u + '" target="_blank" rel="noopener">' + label + "</a>";
}
/* ⭐ 搜索关键词：表 02 第 4 列「B站/网页搜索词」（`courses[].search`）。
   —— 这一列本来就是给人**拿去搜的**，所以做成可点的词块（点一下跳 B 站搜索），
      而不是当普通说明文字摆着；整串还能一键复制（去网页/知乎/Google 搜同一批词）。 */
function kstKwHtml(raw) {
  var s = (raw || "").trim();
  if (!s) return "";
  var parts = s.split(/[;；]/).map(function (x) { return x.trim(); }).filter(Boolean);
  return '<div class="kst-kws"><em>搜索关键词 · 点一下去 B 站搜</em>' +
    parts.map(function (p) {
      return '<a class="kst-kw" href="https://search.bilibili.com/all?keyword=' +
        encodeURIComponent(p) + '" target="_blank" rel="noopener">' + p + "</a>";
    }).join("") +
    '<button class="kst-kw-cp" type="button" data-kw="' + s.replace(/"/g, "&quot;") +
    '">复制全部</button></div>';
}
/* 复制整串关键词：三级降级 —— clipboard → execCommand → 提示手动选中。
   ⚠️ `clipboard.writeText` 在**文档未聚焦**时会 reject（headless / 切走标签时），
      所以 rejected 也要**继续往下降**，别直接报失败（2026-09-22 实测踩到）。 */
function kstCopy(txt, btn) {
  var back = function (ok) {
    if (!btn) return;
    var old = btn.textContent;
    btn.textContent = ok ? "\u2713 已复制" : "\u2717 选中后复制";
    window.setTimeout(function () { btn.textContent = old; }, 1500);
  };
  var legacy = function () {
    var ta = document.createElement("textarea");
    ta.value = txt;
    ta.style.position = "fixed"; ta.style.top = "-100px"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    back(ok);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(function () { back(true); }, legacy);
    return;
  }
  legacy();
}
/* ② 学习资料：一页**行式列表**（一屏放得下，不靠滚动）—— 点一行 → `.ksleaf` 详情 */
function kstBookInfo(c) {
  var raw = c.book || "";
  var bk = (raw && raw !== "\u2014") ? raw : "";
  // "不建议买 AI 原理纸书" 是**忠告**、不是待购 → 不算"要买"，也不给"已入手"
  return { bk: bk, buy: !!bk && bk.indexOf("\u4e0d\u5efa\u8bae") !== 0 };
}
function kstBooksRender() {
  var P = window.STUDY_PLAN, box = document.getElementById("kstBooks");
  if (!P || !box || !P.courses) return;
  box.innerHTML = P.courses.map(function (c) {
    var i = kstBookInfo(c);
    var on = i.buy && kstHas(KST_GEAR_KEY, "bk" + c.order);
    return '<button class="ksrow" type="button" data-bk="' + c.order + '" style="--bd:' +
      (i.buy ? "rgba(255,70,31,.5)" : "rgba(176,140,84,.45)") + '">' +
      '<span class="ksrow-no">' + c.order + "</span>" +
      '<span class="ksrow-b"><b>' + c.content + "</b><i>" + c.stage + " · " + c.how + "</i></span>" +
      '<span class="ksrow-m">' + (i.buy ? (on ? "&#10003; 已有书" : "要买书") : "") + "</span>" +
      '<span class="ksrow-kw" title="附有搜索关键词">搜</span>' +
      "</button>";
  }).join("");
}
function ksBookLeaf(order) {
  var P = window.STUDY_PLAN, c = null;
  if (!P) return;
  P.courses.forEach(function (x) { if (x.order === order) c = x; });
  if (!c) return;
  var i = kstBookInfo(c), on = i.buy && kstHas(KST_GEAR_KEY, "bk" + c.order);
  ksLeafOpen(
    '<button class="ksleaf-x" id="ksLeafX" type="button" aria-label="收起">&#215;</button>' +
    '<p class="ksleaf-k">' + c.stage + " · " + c.order + '</p>' +
    '<h4 class="ksleaf-t">' + c.content + "</h4>" +
    '<div class="ksleaf-q">' + c.rec + "</div>" +
    '<p class="kst-r"><em>怎么学</em><span>' + c.how + "</span></p>" +
    (i.bk ? '<p class="kst-r"><em>' + (i.buy ? "要买" : "书") + '</em><span class="' + (on ? "on" : "") +
      '">' + i.bk + "</span></p>" : "") +
    '<p class="kst-r"><em>学到</em><span>' + c.done + "</span></p>" +
    '<div class="kst-lk">' + kstLink(c.url, /bilibili\.com/.test(c.url) ? "\u25b6 B 站" : "\u25b6 文档") +
      (c.url2 ? kstLink(c.url2, "\u2197 参考") : "") +
      (i.buy ? '<button class="kst-own' + (on ? " on" : "") + '" type="button" data-own="bk' + c.order +
        '" data-on="&#10003; 已入手" data-off="&#9675; 未入手">' +
        (on ? "&#10003; 已入手" : "&#9675; 未入手") + "</button>" : "") +
    "</div>" +
    kstKwHtml(c.search)
  );
}

/* ③ 工具台：右页 —— 按 🟢🟡🔵 三档分组，卡片左沿就是它的"装订档位"（用户原话） */
var KST_TIER = [
  { e: "\ud83d\udfe2", label: "需要装到本机", color: "rgba(120,150,60,.72)" },
  { e: "\ud83d\udfe1", label: "云端可用 / 看情况", color: "rgba(196,150,42,.78)" },
  { e: "\ud83d\udd35", label: "不必单独装", color: "rgba(92,132,190,.72)" }
];
var KST_PRI = { S: 0, A: 1, B: 2 };
/* ⚠️ 别写 `KST_PRI[x] || 9` —— S 的档位值是 **0**，`0 || 9` 会算成 9，
      于是 S 级全被排到最后（2026-09-21 实测踩到：🟢 组首条跑出 Docker 而不是 Claude Code）。 */
function kstPri(p) { return (p && Object.prototype.hasOwnProperty.call(KST_PRI, p)) ? KST_PRI[p] : 9; }
/* ③ 工具台：一页**行式列表**（按档位分组，一屏放得下）—— 点一行 → `.ksleaf` 详情 */
function kstToolsRender() {
  var P = window.STUDY_PLAN, box = document.getElementById("kstTools");
  var mb = document.getElementById("kstMain");
  if (!P || !box || !P.tools) return;
  if (mb && P.quick && P.quick.main) {
    mb.innerHTML = '<div class="kst-main"><b>最终主力组合</b>' + P.quick.main + "</div>";
  }
  var out = "";
  KST_TIER.forEach(function (t) {
    var list = P.tools.filter(function (x) { return (x.inst || "").indexOf(t.e) === 0; });
    if (!list.length) return;
    list.sort(function (a, b) { return kstPri(a.pri) - kstPri(b.pri); });
    out += '<p class="kst-tg ksfull">' + t.e + " " + t.label + "</p>";
    list.forEach(function (x) {
      var on = kstHas(KST_GEAR_KEY, "tl" + x.name);
      out += '<button class="ksrow ksrow-flat" type="button" data-tl="' + x.name +
        '" style="--bd:' + t.color + '">' +
        '<span class="ksrow-b"><b>' + x.name + "</b><i>" + x.cat + " · " + x.why + "</i></span>" +
        '<span class="ksrow-g">' + x.pri + (on ? " &#10003;" : "") + "</span></button>";
    });
  });
  box.innerHTML = out;
}
function ksToolLeaf(name) {
  var P = window.STUDY_PLAN, x = null;
  if (!P) return;
  P.tools.forEach(function (t) { if (t.name === name) x = t; });
  if (!x) return;
  var on = kstHas(KST_GEAR_KEY, "tl" + x.name);
  ksLeafOpen(
    '<button class="ksleaf-x" id="ksLeafX" type="button" aria-label="收起">&#215;</button>' +
    '<p class="ksleaf-k">' + x.cat + " · " + x.pri + " \u7ea7</p>" +
    '<h4 class="ksleaf-t">' + x.name + "</h4>" +
    '<div class="ksleaf-q">' + x.nature + "<br>" + x.inst + "</div>" +
    '<p class="kst-r"><em>为什么</em><span>' + x.why + "</span></p>" +
    '<p class="kst-r"><em>学什么</em><span>' + x.learn + "</span></p>" +
    '<div class="kst-lk">' + kstLink(x.url, "\u2197 官网") +
      '<button class="kst-own' + (on ? " on" : "") + '" type="button" data-own="tl' + x.name +
      '" data-on="&#10003; 已装好" data-off="&#9675; 还没装">' +
      (on ? "&#10003; 已装好" : "&#9675; 还没装") + "</button></div>"
  );
}

/* ④ 修习条目：一页登记簿（全局清单）*/
var KST_KIND = { L: "掌握", O: "产出", G: "条件" };
function kstTallyNow() {
  var P = window.STUDY_PLAN;
  var gi = parseInt(kstFilter, 10);
  if (!P || isNaN(gi) || gi < 0 || gi >= KST_GROUPS.length) gi = 0;
  var g = KST_GROUPS[gi];
  var list = P.tasks.filter(function (t) { return t.n >= g.n[0] && t.n <= g.n[1]; });
  var marks = kstIds(KST_MARK_KEY);
  var done = list.filter(function (t) { return marks.indexOf(t.id) >= 0; }).length;
  // ⚠️ 只报"已留下多少"，**永不报分母 / 剩余**；"记录不是欠债"这句并进同一行，
  //    省下一整行高度（登记簿 22 条时正是这一行的差别决定要不要出滚动条）。
  return "「" + g.key + "」· " + (done ? "已留 " + done + " 道刻痕" : "这一册还没有刻痕") +
    "　——　记的是你做过什么，不是你欠着什么。";
}
function kstRegRender() {
  var P = window.STUDY_PLAN, box = document.getElementById("kstReg");
  if (!P || !box || !P.tasks) return;
  var marks = kstIds(KST_MARK_KEY);
  var gi = parseInt(kstFilter, 10);
  if (isNaN(gi) || gi < 0 || gi >= KST_GROUPS.length) gi = 0;
  kstFilter = String(gi);
  var g = KST_GROUPS[gi];
  var list = P.tasks.filter(function (t) { return t.n >= g.n[0] && t.n <= g.n[1]; });
  var done = list.filter(function (t) { return marks.indexOf(t.id) >= 0; }).length;
  var out = "", cur = 0;
  list.forEach(function (t) {
    if (t.n !== cur) {
      cur = t.n;
      var s = kstStage(t.n);
      out += '<div class="kst-stg">第 ' + String(t.n).padStart(2, "0") + " 级 · " +
        (s ? s.key : "") + "</div>";
    }
    var on = marks.indexOf(t.id) >= 0;
    out += '<button class="kst-c' + (on ? " on" : "") + '" type="button" data-mark="' + t.id + '">' +
      "<span>" + t.text + '</span><em class="kst-c-kind">' + (KST_KIND[t.k] || "") + "</em></button>";
  });
  box.innerHTML = out;
  var cf = document.getElementById("kstCf");
  if (cf) {
    cf.innerHTML = KST_GROUPS.map(function (x, i) {
      return '<b class="' + (i === gi ? "on" : "") + '" data-f="' + i + '">' + x.key + "</b>";
    }).join("");
  }
  var tal = document.getElementById("kstTally");
  if (tal) tal.textContent = kstTallyNow();
}

/* 修习项目档案：从右侧落下（不遮住大厅中央），"纸页归档"而不是弹窗 */
var kstFileGi = 0;                    // 当前打开的修习室下标（撤回后按它重开）
function kstFileOpen(gi) {
  var g = KST_GROUPS[gi];
  if (!g) return;
  var P = window.STUDY_PLAN;
  var lit = kstLit();
  var h = '<div class="fk">' + g.en + '</div><h3>' + g.key + '</h3>' +
    '<p class="fs">' + g.aim + '</p>';
  for (var n = g.n[0]; n <= g.n[1]; n++) {
    var s = kstStage(n);
    if (!s) continue;
    var on = n <= lit;
    h += '<div class="fr"><h4>' + (on ? "已走过" : "待走") + ' · 第 ' + String(n).padStart(2, "0") +
      ' 级</h4><p><b>' + s.key + '</b><br>' + s.why + '</p></div>' +
      '<div class="fstep' + (on ? " on" : "") + '"><b>' + String(n).padStart(2, "0") + '</b>' +
      '<span>' + s.out + '</span>' +
      (on ? '<button class="fgo" type="button" data-un="' + n +
            '" title="撤回这一级（退回第 ' + (n - 1) + ' 级）" aria-label="撤回这一级">&#8617; 撤回</button>'
          : '<span class="fgo" aria-hidden="true"></span>') + '</div>';
    // ②③ 就近重列：这一级要读的书与要用的工具（数据早就在 study-plan.js 里，只是没露出来）
    var near = [];
    var cs = (P && P.courses) ? P.courses.filter(function (c) { return c.stage === s.key; }) : [];
    var tls = (P && P.stageTools && P.stageTools[s.n]) || [];
    if (cs.length) near.push("读：" + cs.map(function (c) { return c.content; }).join(" ／ "));
    if (tls.length) near.push("用：" + tls.join(" · "));
    if (near.length) h += '<div class="fr"><h4>这一级的书与工具</h4><p>' +
      near.join("<br>") + '</p></div>';
  }
  /* ⚠️⚠️ 工具条**必须常驻**（2026-09-22 用户："学习计划我还没走完呢，也没办法取消勾选"）：
     旧写法是 `if (cur && cur.n 落在本方向内)` —— 于是 ① lit=14（走满）时 `kstStage(15)` 为 null
     → **一个按钮都没有**；② 在别的方向的档案里也什么都点不到（下一步不属于这里）。
     现在：点亮按钮（仅 lit<14，不再限定方向）＋ 退回按钮（lit>0 就有）两个都在。 */
  var nxt = kstStage(lit + 1);
  h += '<div class="fbar">';
  if (nxt) {
    h += '<div class="fr"><h4>走上下一级，要能说出</h4><p>' + nxt.gate + '</p></div>' +
      '<button class="fbtn" id="kstLitBtn" type="button" data-n="' + nxt.n + '" data-g="' + gi +
      '">你觉得自己做到了吗？· 点亮「' + nxt.key + '」</button>';
  } else {
    h += '<div class="fr"><h4>这一年已经走满 14 级</h4><p>' +
      '这一年的路走到头了 —— 再往下，就是把走过的重走得更深一层。</p></div>';
  }
  if (lit > 0) {
    var prev = kstStage(lit);
    h += '<button class="fbtn fbtn-un" type="button" data-un="' + lit +
      '" data-g="' + gi + '">&#8617; 退回一级' + (prev ? "（撤回「" + prev.key + "」）" : "") +
      '</button>';
  }
  h += '</div>';
  kstFileGi = gi;                       // 抽屉里撤回后要**重开同一间**
  var b = document.getElementById("kstFileB");
  if (b) b.innerHTML = h;
  var box = document.getElementById("kstFile");
  if (box) {
    box.hidden = false;
    box.scrollTop = 0;
    requestAnimationFrame(function () { box.classList.add("on"); });
  }
}

function kstFileClose() {
  var box = document.getElementById("kstFile");
  if (!box || box.hidden) return;
  box.classList.remove("on");
  window.setTimeout(function () { if (!box.classList.contains("on")) box.hidden = true; }, 440);
}

function kstBind() {
  var box = document.getElementById("kstMap");
  if (box && !box.__kstBound) {
    box.__kstBound = true;
    box.addEventListener("click", function (e) {
      var b = e.target.closest(".kst-mk");
      if (b) kstFileOpen(parseInt(b.getAttribute("data-g"), 10));
    });
  }
  var fb = document.getElementById("kstFile");
  if (fb && !fb.__kstBound) {
    fb.__kstBound = true;
    fb.addEventListener("click", function (e) {
      if (e.target.closest("#kstFileX")) { kstFileClose(); return; }
      var lb = e.target.closest("#kstLitBtn");
      if (lb) {
        kstSetLit(parseInt(lb.getAttribute("data-n"), 10));
        kstSyncAll();
        kstFileOpen(parseInt(lb.getAttribute("data-g"), 10) || kstFileGi);
        return;
      }
      /* 撤回：n-1（台阶是连续路径 —— 撤回第 n 级，就退回到它前面那一级） */
      var ub = e.target.closest("#kstFile [data-un]");
      if (ub) {
        kstSetLit(parseInt(ub.getAttribute("data-un"), 10) - 1);
        kstSyncAll();
        kstFileOpen(kstFileGi);
      }
    });
  }
  /* 前台的小对话条 → 呼出档案纸；纸上的「收起」／点大厅空白 → 收回去 */
  var deskB = document.getElementById("ksDeskB");
  if (deskB && !deskB.__kstBound) {
    deskB.__kstBound = true;
    deskB.addEventListener("click", function () { ksPaper(true); });
  }
  var paperX = document.getElementById("ksPaperX");
  if (paperX && !paperX.__kstBound) {
    paperX.__kstBound = true;
    paperX.addEventListener("click", function () { ksPaper(false); });
  }
  var hall = document.getElementById("ksHall");
  if (hall && !hall.__kstBound) {
    hall.__kstBound = true;
    hall.addEventListener("click", function (e) {
      var p = document.getElementById("ksta");
      if (!p || p.hidden) return;
      if (e.target.closest(".ksta") || e.target.closest(".ksdesk")) return;   // 纸内 / 对话条内不算
      ksPaper(false);
    });
  }

  /* ① 法则纸：入口有两个（纸底一行、前台对话条下面），用 `[data-law]` 统一绑 */
  var laws = document.querySelectorAll(".kshall [data-law]");
  for (var li = 0; li < laws.length; li++) {
    if (laws[li].__kstBound) continue;
    laws[li].__kstBound = true;
    laws[li].addEventListener("click", kstLawOpen);
  }
  var law = document.getElementById("ksLaw");
  if (law && !law.__kstBound) {
    law.__kstBound = true;
    law.addEventListener("click", function (e) {
      if (e.target.closest("#ksLawX")) { kstLawClose(); return; }
      if (!e.target.closest(".kslaw-b")) kstLawClose();
    });
  }

  /* ④ 清单：方向筛选（翻阅某一册，不是"任务管理"） */
  var cf = document.getElementById("kstCf");
  if (cf && !cf.__kstBound) {
    cf.__kstBound = true;
    cf.addEventListener("click", function (e) {
      var b = e.target.closest("[data-f]");
      if (!b) return;
      kstFilter = b.getAttribute("data-f");
      kstRegRender();
    });
  }
  /* ④ 清单：逐条勾选 —— **只改刻痕，不动台阶**（晋级仍只能自己点亮） */
  var reg = document.getElementById("kstReg");
  if (reg && !reg.__kstBound) {
    reg.__kstBound = true;
    reg.addEventListener("click", function (e) {
      var b = e.target.closest("[data-mark]");
      if (!b) return;
      b.classList.toggle("on", kstFlip(KST_MARK_KEY, b.getAttribute("data-mark")));
      var tal = document.getElementById("kstTally");
      if (tal) tal.textContent = kstTallyNow();
      kstSumRender();        // 修习录同步（它只记"留下了多少"，从不报分母）
    });
  }
  /* 大厅的六个入口 → 各自独立一页 */
  var menu = document.getElementById("kstaMenu");
  if (menu && !menu.__kstBound) {
    menu.__kstBound = true;
    menu.addEventListener("click", function (e) {
      var b = e.target.closest("[data-p]");
      if (b) ksPageOpen(b.getAttribute("data-p"));
    });
  }
  var pback = document.getElementById("ksPageBack");
  if (pback && !pback.__kstBound) {
    pback.__kstBound = true;
    pback.addEventListener("click", ksPageClose);
  }
  /* 页内：点一行书 / 一件工具 → 二级详情（不把页面撑长） */
  var page = document.getElementById("ksPage");
  if (page && !page.__kstBound) {
    page.__kstBound = true;
    page.addEventListener("click", function (e) {
      /* 轨迹页每级右侧的撤回（`kstSetLit` 只记一个"走到第几级"，所以是退回 n-1） */
      var ub = e.target.closest("#ksPageC [data-un]");
      if (ub) {
        kstSetLit(parseInt(ub.getAttribute("data-un"), 10) - 1);
        kstSyncAll();
        return;
      }
      var bk = e.target.closest("[data-bk]");
      if (bk) { ksBookLeaf(bk.getAttribute("data-bk")); return; }
      var tl = e.target.closest("[data-tl]");
      if (tl) ksToolLeaf(tl.getAttribute("data-tl"));
    });
  }
  /* 二级详情：点纸外 / × 收走；书「已入手」、软件「已装好」也在这里 */
  var leaf = document.getElementById("ksLeaf");
  if (leaf && !leaf.__kstBound) {
    leaf.__kstBound = true;
    leaf.addEventListener("click", function (e) {
      if (e.target.closest("#ksLeafX")) { ksLeafClose(); return; }
      if (!e.target.closest(".ksleaf-b")) { ksLeafClose(); return; }
      /* 搜索关键词的「复制全部」（词块本身是 <a>，浏览器自己开新窗口，不用管） */
      var cp = e.target.closest("[data-kw]");
      if (cp) { kstCopy(cp.getAttribute("data-kw"), cp); return; }
      var ob = e.target.closest("[data-own]");
      if (!ob) return;
      var gid = ob.getAttribute("data-own");
      kstFlip(KST_GEAR_KEY, gid);
      if (gid.indexOf("bk") === 0) ksBookLeaf(gid.slice(2)); else ksToolLeaf(gid.slice(2));
      kstBooksRender();      // 列表里的"要买书 / 已有书"标记跟着变
      kstToolsRender();
      kstSumRender();
    });
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   知识文档 · 学院阅览厅（**技术文库 ／ 人文文库 共用**，2026-09-22 四·五版）
   用户原话（技术文库）："算了星际风太丑了，还是你自己参考一下学院风的白色系为主风格，
   自己创造一个 ui 界面，最好生成一个动态的背景图，按我说的五个部分设置五个入口，
   入口点进去就是对应的部分。"
   用户原话（人文文库）："人文文库也一样，分五个部分，历史、社科、财经、文学、哲学。"
   ⚠️ 两个分类**共用**这套逻辑，靠 `KTH_SHELVES[kthShelf]` 取各自的五个部分；
      **两级结构**：大厅（五个入口）→ 部分页（该部分目录）→ 阅读页（原有 `openKnowledge`）。
      **没有** canvas / rAF / 拖拽 —— 动效全在 CSS 里（极慢推近 ＋ 光柱横移 ＋ 浮尘上升）。
   ⚠️ 归类靠 `docs.js` 的 **`sub`** 字段；每个分类各有自己的 key 集与兜底 key（`fb`）。
   ⚠️ 类名一律 `kth` 前缀 —— `ksgrid` / `kn-inner` 的类名撞车事故已经两次，加类名前先 Grep 全站。
   ══════════════════════════════════════════════════════════════════════════ */
var KTH_SHELVES = {
  tech: {
    label: "Technical Library", title: "技术文库",
    motto: "凡动手做过、且还想再做一次的，都留在这里 —— 分五间屋子收着。",
    fb: "etc",
    parts: [
      { k: "ai",  name: "AI 应用",     rn: "I",   en: "Artificial Intelligence", note: "从提示词到 Agent" },
      { k: "gis", name: "地理空间系统", rn: "II",  en: "Geospatial Systems",      note: "空间数据的采集、处理与成图" },
      { k: "cad", name: "CAD 制图",    rn: "III", en: "Computer-Aided Design",   note: "图纸、建模与二次开发" },
      { k: "pl",  name: "编程语言", rn: "IV",  en: "Languages",               note: "语法、工具链与踩过的坑" },
      { k: "etc", name: "其他领域", rn: "V",   en: "Miscellany",              note: "放不进前四格、迟早用得上的" }
    ]
  },
  humanities: {
    label: "Humanities Library", title: "人文文库",
    motto: "人文不解决「怎么做」，只回答「怎么看待」 —— 分五间屋子，慢慢读。",
    fb: "lit",
    parts: [
      { k: "hist", name: "历史", rn: "I",   en: "History",          note: "谁在记录，为什么这样记" },
      { k: "soc",  name: "社科", rn: "II",  en: "Social Sciences",  note: "观察人群的几种方法" },
      { k: "fin",  name: "财经", rn: "III", en: "Economics & Finance", note: "钱与判断的算术" },
      { k: "lit",  name: "文学", rn: "IV",  en: "Literature",       note: "读、写与共情" },
      { k: "phi",  name: "哲学", rn: "V",   en: "Philosophy",       note: "把「我觉得」拆开来看" }
    ]
  }
};

var kthShelf = "";       // 当前在哪个分类（"tech" / "humanities"）
var kthPart = "";        // 当前在哪个部分（"" ＝ 大厅）
var kthDocList = [];     // 当前部分页的文档（列表项按序号取用）

/* 细线徽记（内联 SVG：不引外部资源，线宽与铜版画一致） */
var KTH_EMBLEM = {
  /* ── 技术文库 ── */
  ai:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"><path d="M12 3.1l1.55 7.35L20.9 12l-7.35 1.55L12 20.9l-1.55-7.35L3.1 12l7.35-1.55z"/><circle cx="18.6" cy="18.2" r="1.5"/></svg>',
  gis: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15"><circle cx="12" cy="12" r="8.3"/><ellipse cx="12" cy="12" rx="3.8" ry="8.3"/><path d="M3.9 12h16.2"/></svg>',
  cad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"><circle cx="12" cy="4.2" r="1.3"/><path d="M12 5.5L5.6 20.4M12 5.5l6.4 14.9"/><path d="M8 14.2c2.6 1.4 5.4 1.4 8 0"/></svg>',
  pl:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"><path d="M9.4 3.6H8.2a2 2 0 0 0-2 2v3.1a2.4 2.4 0 0 1-2.4 2.4v1.8a2.4 2.4 0 0 1 2.4 2.4v3.1a2 2 0 0 0 2 2h1.2"/><path d="M14.6 3.6h1.2a2 2 0 0 1 2 2v3.1a2.4 2.4 0 0 0 2.4 2.4v1.8a2.4 2.4 0 0 0-2.4 2.4v3.1a2 2 0 0 1-2 2h-1.2"/></svg>',
  etc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"><path d="M12 6.7C9.8 5.1 7.2 4.5 4.2 4.7v12.6c3-.2 5.6.4 7.8 2 2.2-1.6 4.8-2.2 7.8-2V4.7c-3-.2-5.6.4-7.8 2z"/><path d="M12 6.7v12.6"/></svg>',
  /* ── 人文文库 ── */
  hist: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"><path d="M6.8 3.8h10.4M6.8 20.2h10.4"/><path d="M8.4 3.8c0 3.4 7.2 5 7.2 8.2s-7.2 4.8-7.2 8.2"/><path d="M15.6 3.8c0 3.4-7.2 5-7.2 8.2s7.2 4.8 7.2 8.2"/></svg>',
  soc:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15"><circle cx="12" cy="5.6" r="2.6"/><circle cx="5.4" cy="17.4" r="2.6"/><circle cx="18.6" cy="17.4" r="2.6"/><path d="M10.4 7.8 7 15.2M13.6 7.8l3.4 7.4M8 17.4h8"/></svg>',
  fin:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"><path d="M3.8 20.2h16.4M3.8 20.2V4.2"/><path d="M6.6 16.4l4-4.6 3.2 2.5 4.6-6.3"/><path d="M15.6 8h2.8v2.8"/></svg>',
  lit:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"><path d="M19.6 4.4c-5 .4-9.2 3.1-11.2 7.8L6.7 16l3.8-1.7c4.7-2 7.4-6.2 7.8-11.2z"/><path d="M6.9 17 3.6 20.3"/><path d="M11.4 9.2c1.5.4 2.8 1.7 3.2 3.2"/></svg>',
  phi:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"><path d="M9.2 20.4h5.6M10.2 20.4v-2.2h3.6v2.2"/><path d="M8.4 15.6c-1.1-1-1.8-2.5-1.8-4.2a5.4 5.4 0 0 1 10.8 0c0 1.7-.7 3.2-1.8 4.2z"/><path d="M12 3.6v1.4"/></svg>'
};

function kthEsc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function kthSet(id, txt) {
  var el = document.getElementById(id);
  if (el) el.textContent = txt == null ? "" : txt;
}
function kthConf() { return KTH_SHELVES[kthShelf] || { parts: [], fb: "etc" }; }
function ksPartByK(k) {
  var ps = kthConf().parts;
  for (var i = 0; i < ps.length; i++) if (ps[i].k === k) return ps[i];
  return null;
}
function kthShelfDocs() { return knShelfDocs(kthShelf); }
function kthDocsOf(k) {
  var fb = kthConf().fb;
  return kthShelfDocs().filter(function (d) { return (d.sub || fb) === k; });
}

/* 浮尘：一次性生成 26 颗（随机位置/大小/周期），之后全靠 CSS 动画 —— 不占主线程 */
function kthMotesBuild() {
  var box = document.getElementById("kthMotes");
  if (!box || box.childNodes.length) return;
  var out = "";
  for (var i = 0; i < 26; i++) {
    out += '<i style="--x:' + (Math.random() * 100).toFixed(2) + '%;--y:' +
      (26 + Math.random() * 74).toFixed(2) + '%;--s:' + (1.2 + Math.random() * 2.4).toFixed(2) +
      'px;--dd:' + (17 + Math.random() * 19).toFixed(1) + 's;--dl:-' +
      (Math.random() * 32).toFixed(1) + 's"></i>';
  }
  box.innerHTML = out;
}

/* 大厅：题头 ＋ 五个入口卡（编号 / 徽记 / 名 / 西文 / 计数） */
function kthCardsRender() {
  var box = document.getElementById("kthCards");
  if (!box) return;
  var C = kthConf();
  kthSet("kthEyebrow", C.label + " · 五个部分");
  kthSet("kthTitle", C.title);
  kthSet("kthMotto", C.motto);
  box.innerHTML = C.parts.map(function (p, i) {
    var n = kthDocsOf(p.k).length;
    return '<button class="kth-card' + (n ? "" : " off") + '" type="button" data-k="' + p.k +
      '" style="--i:' + i + '" aria-label="' + kthEsc(p.name) + '">' +
      '<span class="kth-rn">' + p.rn + '</span>' +
      '<span class="kth-em">' + (KTH_EMBLEM[p.k] || "") + '</span>' +
      '<b class="kth-nm">' + kthEsc(p.name) + '</b>' +
      '<i class="kth-en">' + kthEsc(p.en) + '</i>' +
      '<span class="kth-hr"></span>' +
      '<em class="kth-ct"><b>' + String(n).padStart(2, "0") + '</b> 篇</em>' +
      '<u class="kth-go">进 入</u></button>';
  }).join("");
}

function kthHintRender() {
  kthSet("kthHint", kthPart
    ? "点一行翻开 —— 或按 ESC 回到大厅"
    : "五个部分，各有一间自己的书架 —— 点一个入口进去");
}

/* 大厅 → 某个部分：视角**不进不退**，只是把大厅淡走、把目录浮上来（背景不动，
   所以读起来像"在同一间屋子里往里走了一步"）。 */
function kthFocus(k) {
  var p = ksPartByK(k);
  if (!p) return;
  var docs = kthDocsOf(k);
  kthPart = k;
  kthDocList = docs;

  kthSet("kthSecRn", p.rn);
  kthSet("kthSecN", p.name);
  kthSet("kthSecE", p.en + " · " + p.note);
  kthSet("kthSecC", docs.length + " 篇");
  kthSet("kthTopT", p.rn + " · " + p.name);

  var rows = document.getElementById("kthRows");
  if (rows) {
    rows.scrollTop = 0;
    rows.innerHTML = docs.length ? docs.map(function (d, i) {
      return '<button class="kth-row" type="button" data-i="' + i + '">' +
        '<span class="kth-row-no">' + String(i + 1).padStart(2, "0") + '</span>' +
        '<span class="kth-row-b"><b>' + kthEsc(d.title || "") + '</b>' +
        '<i>' + kthEsc(d.summary || "") + '</i></span>' +
        '<span class="kth-row-m">' + kthEsc(d.date || "") + '</span>' +
        '<span class="kth-row-go">&#8594;</span></button>';
    }).join("") : '<p class="kth-empty">这一间还空着 —— 先留个位置。</p>';
  }

  var hall = document.getElementById("kthHall");
  if (hall) hall.classList.add("out");
  var sec = document.getElementById("kthSec");
  if (sec) {
    sec.hidden = false;
    requestAnimationFrame(function () { sec.classList.add("on"); });
    window.setTimeout(function () { sec.classList.add("on"); }, 60);
  }
  var back = document.getElementById("kthBack");
  if (back) back.hidden = false;
  /* 「← 回到目录」收走 —— 它与「← 回到文库」同角，**一屏只留一个返回** */
  var sh = document.getElementById("knShelf");
  if (sh) sh.classList.add("kth-part");
  kthHintRender();
}

/* 某个部分 → 大厅 */
function kthHome() {
  kthPart = "";
  var hall = document.getElementById("kthHall");
  if (hall) hall.classList.remove("out");
  var sec = document.getElementById("kthSec");
  if (sec) sec.classList.remove("on");
  var back = document.getElementById("kthBack");
  if (back) back.hidden = true;
  kthSet("kthTopT", kthConf().label || "Knowledge Library");
  var sh = document.getElementById("knShelf");
  if (sh) sh.classList.remove("kth-part");
  window.setTimeout(function () {
    var s = document.getElementById("kthSec");
    if (s && !kthPart) s.hidden = true;      // 期间又点进去的话别收
  }, 340);
  kthHintRender();
}

/* 事件委托：容器是静态的，所以只挂一次（卡片与行是动态渲染的） */
function kthBind() {
  var cards = document.getElementById("kthCards");
  if (cards && !cards.__kth) {
    cards.__kth = 1;
    cards.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".kth-card") : null;
      if (b) kthFocus(b.getAttribute("data-k"));
    });
  }
  var rows = document.getElementById("kthRows");
  if (rows && !rows.__kth) {
    rows.__kth = 1;
    rows.addEventListener("click", function (e) {
      var r = e.target.closest ? e.target.closest(".kth-row") : null;
      if (!r) return;
      var d = kthDocList[+r.getAttribute("data-i")];
      if (d) openKnowledge(d);
    });
  }
  var back = document.getElementById("kthBack");
  if (back && !back.__kth) {
    back.__kth = 1;
    back.addEventListener("click", kthHome);
  }
}

/* `shelf` ＝ "tech" / "humanities" —— 决定取哪五个部分、哪张背景图、哪套配色 */
function kthOpen(shelf) {
  var w = document.getElementById("kthWall");
  if (!w || !KTH_SHELVES[shelf]) return;
  kthShelf = shelf;
  w.setAttribute("data-shelf", shelf);     // 配色变量与背景图都挂在这上面
  kthMotesBuild();
  kthCardsRender();
  kthBind();
  kthHome();                       // 每次进这一格都从**大厅**开始（不记上次停在哪个部分）
  w.hidden = false;
  w.classList.remove("in");
  void w.offsetWidth;              // 强制重排 → 入场过渡与五张卡的依次浮现才会跑
  requestAnimationFrame(function () { w.classList.add("in"); });
  window.setTimeout(function () { w.classList.add("in"); }, 60);
}
function kthClose() {
  var w = document.getElementById("kthWall");
  if (w) { w.classList.remove("in"); w.hidden = true; }
  kthPart = "";
  kthDocList = [];
  var sh = document.getElementById("knShelf");
  if (sh) sh.classList.remove("kth-part");
}

/* ══════════════════════════════════════════════════════════════════════════
   知识文档 · **馆藏原件 ＝ 罗马图书馆**（2026-09-22 新做）
   用户原话："馆藏原件要有一个深邃、宏大、千万不能小家子气的图书馆，采用罗马风格建筑体系，
   我希望点击按钮后有一个开门的动画，视角逐渐放大到博物馆内，中间站着一个女性、可爱、20-24岁的
   接待员，不提供任何按钮，她会先说一句'早上好/中午好/下午好/晚上好，请问您需要调取哪篇文档资料？'，
   你再点击就会弹出一个文本框：需要输入编号，输入编号格式对了才会弹出对应的文档信息，
   不对就回复抱歉，你输入的文档编号不存在"
   ⚠️ 场景里**零按钮**：进门＝点画面；报编号＝键盘回车。卡纸里只有文本式的调取／回到目录。
   ⚠️ 时序（改任一步都要回头改后面每步的 delay，视觉与 CSS 里的 transition 是对表的）：
       点门 → `open`（门扇 1.45s 转开）→ 760ms `push`（外景放大淡出 ＋ 内厅推近 ＋ 她淡入）
            → 2400ms 问候语打字机 → 之后随便点一下画面 → 调阅台
   ⚠️ 编号规则（用户口述）：**A/B ＋ 部分 01-05 ＋ 序号 001**；`S` 前缀是站内补的馆务档。
   ══════════════════════════════════════════════════════════════════════════ */
var ARC_LETTER = { tech: "A", humanities: "B" };
var arcIdxCache = null;
var arcState = "";          /* "" | door | opening | inside | ask | slip */
var arcTimers = [];
var arcHit = null;          /* 调阅单上那一件 */

function arcEl(id) { return document.getElementById(id); }
function arcPad(n, w) { var s = String(n); while (s.length < w) s = "0" + s; return s; }
function arcSet(id, t) {
  var el = arcEl(id);
  if (el) el.textContent = (t == null ? "" : t);
}
function arcAfter(fn, ms) { var t = window.setTimeout(fn, ms); arcTimers.push(t); return t; }
/* 入场类名一律【rAF ＋ 60ms 兜底】：headless / 后台标签下 rAF 会被节流甚至不跑（本仓踩过） */
function arcOn(el, cls) {
  if (!el) return;
  el.hidden = false;
  el.classList.remove(cls);
  void el.offsetWidth;
  requestAnimationFrame(function () { el.classList.add(cls); });
  window.setTimeout(function () { el.classList.add(cls); }, 60);
}
function arcOff(el, cls) { if (el) { el.classList.remove(cls); el.hidden = true; } }

/* 编号表：{ "A01001": {doc, shelf, part, code} } —— `sub` 决定落在第几个部分，部分内按 docs.js 顺序排 */
function arcBuildIndex() {
  var map = {};
  ["tech", "humanities"].forEach(function (sh) {
    var conf = KTH_SHELVES[sh];
    if (!conf) return;
    var docs = knShelfDocs(sh);
    conf.parts.forEach(function (p, pi) {
      var seq = 0;
      docs.forEach(function (d) {
        if ((d.sub || conf.fb) !== p.k) return;
        seq++;
        var code = ARC_LETTER[sh] + arcPad(pi + 1, 2) + arcPad(seq, 3);
        map[code] = { doc: d, shelf: sh, part: p, code: code };
      });
    });
  });
  /* ⚠️ 站内补的 `S` 前缀：馆务文档（《取阅须知》《原件清单》）不在 A/B 两库里，
        不给编号就彻底没有入口 —— 用户口述的规则只覆盖 A/B，这一条在报告里言明。 */
  knShelfDocs("archive").forEach(function (d, i) {
    var code = "S" + arcPad(i + 1, 5);
    map[code] = { doc: d, shelf: "archive", part: null, code: code };
  });
  return map;
}
function arcIndex() {
  if (!arcIdxCache) arcIdxCache = arcBuildIndex();
  return arcIdxCache;
}
/* 输入归一化：全角→半角、去掉空格/连字符/点、转大写；部分号少写一位也认（A1001 → A01001） */
function arcNorm(raw) {
  var t = String(raw == null ? "" : raw).replace(/[\uFF01-\uFF5E]/g, function (c) {
    return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
  });
  t = t.replace(/[\s\-_.·、,，/\\]/g, "").toUpperCase();
  if (/^[ABS]\d{4}$/.test(t)) t = t.charAt(0) + "0" + t.slice(1);
  return t;
}
/* 问候语随时段走（5-11 早上／11-13 中午／13-18 下午／其余 晚上） */
function arcGreetWord() {
  var h = (new Date()).getHours();
  if (h >= 5 && h < 11) return "早上好";
  if (h >= 11 && h < 13) return "中午好";
  if (h >= 13 && h < 18) return "下午好";
  return "晚上好";
}
function arcGreetText() { return arcGreetWord() + "，请问您需要调取哪篇文档资料？"; }
/* ⚠️ 底部提示条已按用户要求**整个移除**（2026-09-22：那条白色渐变底把场景底部压出一道白边，
   很出戏 —— 见 `index.html` 里被注释掉的 `.arc-hint` 样式）。
   引导改由两层承担：她的时段问候（"请问您需要调取哪篇文档资料？"）＋ 卡纸里的文本选项。
   `arcHint()` 保留为**空操作** —— 状态机里十来个调用点先不动，将来想恢复提示时
   把 `#arcHint` 元素和 `.arc-hint` 样式加回来就能用。 */
function arcHint(t) { }
/* ⚠️⚠️ 判"这一层真的开着"**不能只看 `hidden`** —— 要两个条件。
   `hidden === false` 只是半个条件：**年度修习那张纸（`#ksta`）在切走分类之后会留着
   `hidden=false`**（它的父级 `.ks-study` 已经 `display:none` 了，所以肉眼根本看不见），
   而 ESC 分级链原先只判 `hidden` → **那张看不见的纸会把 ESC 吃掉一次**，
   表现就是"按了 ESC 什么都没发生"（2026-09-22 在馆藏原件的回归里抓到：
   现场 dump 出 `paper:false` 而画面上什么纸都没有）。
   `getClientRects().length` 在「自身或任一祖先 `display:none`」时为 0 —— 这才叫"真的在画面上"。
   ⚠️ 别用 `offsetParent === null` 代替：`position:fixed` 的元素恒为 null。 */
function ksRendered(el) {
  return !!(el && !el.hidden && el.getClientRects().length > 0);
}
/* 这一层是否"在场"：`#arcWall` 显示着，**且阅读页没打开** ——
   ⚠️ 阅读页是叠在它上面的另一层（进正文时 `#knShelf` 只是 `visibility:hidden`，
      `#arcWall.hidden` 仍然是 false）→ 判"在场"只看 `hidden` 会把正文页里的 ESC 抢走。
   ⚠️⚠️ 判阅读页**也不能用 `style.display !== "none"`**：它初始 `display:none` 是写在 **CSS** 里的，
      而代码里有人把它清成了空串 → `"" !== "none"` 恒真，判据整个失效（当天实测过一次）。
      统一走 `ksRendered`。 */
function arcActive() {
  var w = arcEl("arcWall");
  if (!w || w.hidden) return false;
  return !ksRendered(arcEl("knowledgeDetail"));
}
function arcCloseCard() {
  var c = arcEl("arcCard");
  if (c) { c.classList.remove("on"); c.hidden = true; }
  arcOff(arcEl("arcErr"), "shake");
  var a = arcEl("arcAsk"); if (a) a.hidden = false;
  var s = arcEl("arcSlip"); if (s) s.hidden = true;
  arcHit = null;
}
function arcReset() {
  for (var i = 0; i < arcTimers.length; i++) window.clearTimeout(arcTimers[i]);
  arcTimers = [];
  arcHit = null;
  arcState = "";
  var w = arcEl("arcWall");
  if (w) w.classList.remove("in", "open", "push");
  arcOff(arcEl("arcSay"), "on");
  arcSet("arcSayB", "");
  arcCloseCard();
  var inp = arcEl("arcCode"); if (inp) inp.value = "";
  arcHint("");
}
/* 问候语：逐字打出（`prefers-reduced-motion` 下整句直出） */
function arcSay() {
  var box = arcEl("arcSay"), b = arcEl("arcSayB");
  if (!box || !b) return;
  var txt = arcGreetText();
  arcOn(box, "on");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { b.textContent = txt; return; }
  var i = 0;
  b.textContent = "";
  (function step() {
    if (i > txt.length) return;
    b.textContent = txt.slice(0, i);
    i++;
    arcAfter(step, 56);
  })();
}
function arcOpen() {
  var w = arcEl("arcWall");
  if (!w) return;
  arcReset();
  arcBind();
  w.hidden = false;
  void w.offsetWidth;
  requestAnimationFrame(function () { w.classList.add("in"); });
  window.setTimeout(function () { w.classList.add("in"); }, 60);
  arcState = "door";
  arcHint("轻触门扉 · 进入馆内");
}
function arcClose() {
  arcReset();
  var w = arcEl("arcWall");
  if (w) w.hidden = true;
}
/* 点门 → 两片门扇转开 ＋ 镜头推入到内厅 */
function arcEnter() {
  var w = arcEl("arcWall");
  if (!w || arcState !== "door") return;
  arcState = "opening";
  arcHint("");
  w.classList.add("open");
  arcAfter(function () { w.classList.add("push"); }, 760);
  arcAfter(function () {
    arcState = "inside";
    arcSay();
    arcHint("点一下画面 · 向接待员报出文档编号");
  }, 2400);
}
/* 再点画面 → 弹出调阅台（文本框） */
function arcAskOpen() {
  if (arcState === "inside" || arcState === "slip") arcState = "ask";
  if (arcState !== "ask") return;
  cardRestore();
  /* ⚠️ 调阅台一开就把问候语收走 —— 两张纸片挂在同一条竖直线上会互相压
     （2026-09-22 用户截图："对话框不要遮住接待员的脸"；卡纸的位置也一并挪到她头顶之上）。 */
  arcOff(arcEl("arcSay"), "on");
  var tip = arcEl("arcTip");
  if (tip) {
    tip.innerHTML = "编号＝<b>A／B</b>（技术／人文）＋ <b>01–05</b>（部分）＋ <b>001</b>（序号）<br>" +
      "例 <b>A01001</b> ／ <b>B04002</b> · 本馆现存 <b>" + Object.keys(arcIndex()).length +
      "</b> 件 · 回车确认";
  }
  arcOn(arcEl("arcCard"), "on");
  arcHint("");
  arcAfter(function () { var i = arcEl("arcCode"); if (i) i.focus(); }, 190);
}
function cardRestore() {
  var a = arcEl("arcAsk"); if (a) a.hidden = false;
  var s = arcEl("arcSlip"); if (s) s.hidden = true;
  var e = arcEl("arcErr"); if (e) { e.hidden = true; e.textContent = ""; }
  arcHit = null;
}
/* 收起卡纸（调阅台／调阅单）→ 回到内厅：问候语放回来、底部提示重新出现。
   ⭐ **ESC 与"点画面任意处"共用这一条**（用户 2026-09-22：呼出对话框后，点任意地方也能缩回）；
     两个入口只留一份实现，免得以后改一处漏一处。
   ⚠️ 收卡纸**不清输入框** —— 缩回再打开时用户刚敲的编号还在（`arcReset` 才清）。 */
function arcCardBack() {
  if (arcState !== "ask" && arcState !== "slip") return false;
  arcCloseCard();
  arcState = "inside";
  arcOn(arcEl("arcSay"), "on");      // 文字还在，不重打
  arcHint("点一下画面 · 向接待员报出文档编号");
  return true;
}
/* 提交编号：命中 → 调阅单；没命中（含格式不对）→ 同一句回话 */
function arcSubmit() {
  if (arcState !== "ask") return;
  var inp = arcEl("arcCode");
  var hit = arcIndex()[arcNorm(inp ? inp.value : "")];
  var er = arcEl("arcErr");
  if (!hit) {
    if (er) {
      er.textContent = "抱歉，你输入的文档编号不存在";
      er.hidden = false;
      er.classList.remove("shake");
      void er.offsetWidth;
      er.classList.add("shake");
    }
    if (inp) { if (inp.select) inp.select(); inp.focus(); }
    return;
  }
  arcHit = hit;
  arcState = "slip";
  if (er) { er.hidden = true; er.textContent = ""; }
  arcSet("arcSlipC", "NO. " + hit.code);
  arcSet("arcSlipT", hit.doc.title || "（无题）");
  arcSet("arcSlipS", hit.doc.summary || "");
  var lib = hit.shelf === "tech" ? "技术文库" : hit.shelf === "humanities" ? "人文文库" : "馆务";
  arcSet("arcSlipM", lib + " ｜ " + (hit.part ? hit.part.rn + " · " + hit.part.name : "馆内须知") +
    (hit.doc.date ? " ｜ " + hit.doc.date : "") +
    (hit.doc.tags && hit.doc.tags.length ? " ｜ " + hit.doc.tags.join(" · ") : ""));
  var a = arcEl("arcAsk"); if (a) a.hidden = true;
  var s = arcEl("arcSlip"); if (s) s.hidden = false;
}
/* 调阅单 → 阅读页（`openKnowledge` 会把 `#knShelf` 整块收走，本层也在里面） */
function arcReadNow() {
  if (arcState !== "slip" || !arcHit) return;
  var d = arcHit.doc;
  arcHint("");
  openKnowledge(d);
}
function arcBind() {
  var w = arcEl("arcWall");
  if (!w) return;
  if (!w.__arc) {
    w.__arc = 1;
    w.addEventListener("click", function (e) {
      /* 卡纸内部的点击不算"点画面" —— 否则输入框刚弹出来就被自己关掉 */
      if (e.target.closest && e.target.closest(".arc-card")) return;
      if (arcState === "door") arcEnter();
      else if (arcState === "inside") arcAskOpen();
      /* ⭐ 卡纸（调阅台／调阅单）已经开着 → **再点画面任意处就把它缩回内厅**
         （用户 2026-09-22："呼出对话框后，点击任意地方还能缩回"）。
         这一条是鼠标／触屏唯一的退路 —— 手机上根本没有 ESC 键。 */
      else arcCardBack();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      /* ⚠️ 输入框里那一下回车**必须排除**：它在 `#arcCode` 上已经 `arcSubmit()` 出了调阅单，
         事件再冒到这儿时状态正好是 `slip` → 会把刚生成的调阅单**立刻**当"回车阅读"吃掉
         （2026-09-22 实测：填完编号按回车直接蹦进正文，跳过了调阅单）。 */
      var t = e.target;
      if (t && t.id === "arcCode") return;
      if (arcState === "slip" && arcActive()) { e.preventDefault(); arcReadNow(); }
    });
  }
  var inp = arcEl("arcCode");
  if (inp && !inp.__arc) {
    inp.__arc = 1;
    inp.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      e.preventDefault();
      arcSubmit();
    });
  }
  var g = arcEl("arcGo");
  if (g && !g.__arc) { g.__arc = 1; g.addEventListener("click", arcSubmit); }
  var bk = arcEl("arcToPortal");
  if (bk && !bk.__arc) {
    bk.__arc = 1;
    bk.addEventListener("click", function () { knShelfBack(); });
  }
  var rd = arcEl("arcRead");
  if (rd && !rd.__arc) { rd.__arc = 1; rd.addEventListener("click", arcReadNow); }
  var ag = arcEl("arcAgain");
  if (ag && !ag.__arc) {
    ag.__arc = 1;
    ag.addEventListener("click", function () { if (arcState === "slip") arcAskOpen(); });
  }
}

function knOpenShelf(shelf) {
  var list = knShelfDocs(shelf);
  if (!list.length) return;
  var sh = document.getElementById("knShelf");
  if (!sh) { openKnowledge(list[0]); return; }
  var meta = KN_SHELF_META[shelf] || {};
  knShelfList = list;
  sh.setAttribute("data-shelf", shelf);
  document.getElementById("ksEyebrow").textContent = meta.eyebrow || "Knowledge Archive";
  document.getElementById("ksTitle").textContent = meta.title || shelf;
  document.getElementById("ksSub").textContent = meta.sub || "";
  document.getElementById("ksFoot").textContent = meta.foot || "";
  document.getElementById("ksList").innerHTML = list.map(function (d, i) {
    return '<button class="ks-item" type="button" data-i="' + i + '" style="--i:' + i + '">' +
      '<span class="ks-no">' + String(i + 1).padStart(2, "0") + '</span>' +
      '<span class="ks-tx"><b>' + (d.title || "") + '</b><i>' + (d.summary || "") + '</i></span>' +
      '<span class="ks-go">&#8594;</span></button>';
  }).join("");
  var kh = document.getElementById("knowledgeHome");
  if (kh) kh.hidden = true;
  var kd = document.getElementById("knowledgeDetail");
  if (kd) kd.style.display = "none";
  sh.hidden = false;
  sh.classList.remove("ks-behind");   // 兜底：清掉"让位给阅读页"的残留状态
  sh.classList.remove("ks-in");
  void sh.offsetWidth;                                        // 强制重排 → 入场过渡才会跑
  requestAnimationFrame(function () { sh.classList.add("ks-in"); });
  // 顶栏配色跟着**场景亮度**走：rule（大厅）/ archive（书架区）/ tech（阅览厅）/
  // humanities（人文阅览室）—— 四个都是米纸插画＝亮场景 → 统一学院风浅色顶栏（深色字）。
  var bright = (shelf === "rule" || shelf === "archive" ||
                shelf === "tech" || shelf === "humanities");
  var st = document.getElementById("knowledgeStage");
  if (st) { st.classList.toggle("kn-home-on", bright); st.classList.add("kn-subpage"); }
  kstFileClose();                      // 换分类时，收起上一级留下的抽屉
  kthClose();                          // 阅览厅先收（幂等），下面按分类重新开
  arcClose();                          // 罗马图书馆同理先收（幂等）
  // 技术文库 / 人文文库 ＝ 学院阅览厅（2026-09-22 四·五版）—— 两个分类共用这一套
  if (shelf === "tech" || shelf === "humanities") kthOpen(shelf);
  // 馆藏原件 ＝ 罗马图书馆（2026-09-22 新做）：站在门外，点画面推门进去
  if (shelf === "archive") arcOpen();
  ksPageReset();                        // 以及可能开着的独立页 / 二级详情
  if (shelf === "rule") kstRender();    // 「年度修习」＝学院大厅 ＋ 六个入口（其余三格仍走卡片列表）
  knPortalClock(false);
}

// 分类空间 → 回门户目录
function knShelfBack() {
  kthClose();
  arcClose();
  var sh = document.getElementById("knShelf");
  if (sh) { sh.classList.remove("ks-in"); sh.hidden = true; sh.setAttribute("data-shelf", ""); }
  knShelfList = [];
  kstFileClose();
  ksPageReset();
  var kh = document.getElementById("knowledgeHome");
  if (kh) kh.hidden = false;
  var st = document.getElementById("knowledgeStage");
  if (st) { st.classList.add("kn-home-on"); st.classList.remove("kn-subpage"); }
  knPortalClock(true);
}

// 当前是否停在某个分类空间里（阅读页返回要用）
function knInShelf() {
  var sh = document.getElementById("knShelf");
  return !!(sh && !sh.hidden);
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
  st.classList.remove("kn-subpage");     // 门户页保留顶栏（它是这页的出口）
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
  if (st) { st.hidden = true; st.classList.remove("kn-home-on", "kn-subpage"); }
  document.body.style.overflow = "";
  knPortalClock(false);
}

// 回到门户首页（从沉浸阅读返回 / ESC）
function knBackToHome() {
  var kd = document.getElementById("knowledgeDetail");
  if (kd) kd.style.display = "none";
  // ⭐ 批十七：如果这篇是从某个「分类空间」里点开的，返回时**回到那个空间**，
  //    而不是弹回目录 —— 否则每次读完一篇都要重新进一遍房间。
  if (knInShelf()) {
    var _sh = document.getElementById("knShelf");
    if (_sh) _sh.classList.remove("ks-behind");   // 把刚才让位给阅读页的房间露回来
    knPortalClock(false); return;
  }
  var kh = document.getElementById("knowledgeHome");
  if (kh) kh.hidden = false;
  var st = document.getElementById("knowledgeStage");
  if (st) { st.classList.add("kn-home-on"); st.classList.remove("kn-subpage"); }   // 顶栏回学院风浅色
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
  // ⭐ 这篇若是从某个分类空间点开的，把空间层**收走** —— 否则它的背景会透到阅读页上
  //   （2026-09-21 用户指出：从「年度修习」进文档，阅读页顶部还露出大厅）。
  //   用 class 而非 hidden：hidden 会骗过 knInShelf()，把"从哪个空间来"的信息弄丢。
  var _sh = document.getElementById("knShelf");
  if (_sh) _sh.classList.add("ks-behind");
  var st = document.getElementById("knowledgeStage");
  if (st) { st.classList.remove("kn-home-on"); st.classList.add("kn-subpage"); }   // 阅读页也是内页：连顶栏一起收
  knPortalClock(false);
  var kd = document.getElementById("knowledgeDetail");
  kd.style.display = "";
  document.getElementById("knTitle").textContent = d.title;
  document.getElementById("knMeta").textContent = (d.date || "") + "  ·  知识文档";
  document.getElementById("knBody").innerHTML = d.content || "<p>暂无内容</p>";
  buildToc("knBody", "knToc");
  kd.scrollTop = 0;
}

// ---------- 6. 空闲预热门的图片（2026-09-20 批一：治"猫头鹰飞来一卡一卡、飞走不卡"）----------
//   症状为什么是"飞来卡、飞走不卡"：飞入发生在**门刚露脸**的那一刻，而那一刻同时压着三件事 ——
//     ① 门的书卷插画 knowledge-bg.jpg（310 KB）首次解码
//     ② 树上那几张 `<img>` 首次解码（懒加载 ⇒ 正好排在露脸这一刻）
//     ③ 墨迹 canvas 的 setup/size/头几帧
//   飞离发生在几秒之后，这些都早已冷启动完毕 → 所以"飞走不卡"。
//   治法：**页面 load 之后、浏览器空闲时**把门的图预先取回并 `decode()` ——
//     不进首屏关键路径（首屏仍是 9 请求 / 0.44 MB），却让门一露脸时全是解码好的位图。
function warmGateImages() {
  var list = [
    "assets/forest-wide.webp?v=20260921a",
    "assets/branch-fade.webp?v=20260920g",
    "assets/crest-post.webp?v=20260920d",
    
    "assets/owl-line.webp?v=20260921b",
    "assets/knowledge-owl.webp?v=20260921e",
    "assets/hills-far.webp?v=20260921d",
    "assets/wheat-base.webp?v=20260921i",
    "assets/knowledge-bg.jpg?v=20260920a",
    "assets/knight-l.webp?v=20260921f",
    "assets/knight-r.webp?v=20260921f",
    "assets/hall-great.webp?v=20260921b",
    "assets/hall-shelf.webp?v=20260921a",
    /* 技术文库 · 学院阅览厅的整幅背景（2026-09-22 四版新增，306 KB）——
       ⚠️ 它挂在 `.kthwall` 上，而那一层平时 `hidden`（背景图不会提前下载）→
       不预热的话，点「技术文库」的瞬间才开始下 306 KB，大厅会先白一下。 */
    "assets/tech-hall.webp?v=20260922a",
    /* 人文文库 · 同一座楼的老书房（2026-09-22 五版新增，308 KB）—— 同样必须预热 */
    "assets/hum-hall.webp?v=20260922a",
    /* 馆藏原件 · 罗马图书馆（2026-09-22 新增）：**只预热"门"和"内厅"**——
       门是进门第一眼（必须已经在缓存里），内厅在 760ms 后就要露出来；
       接待员（65 KB）要 2.4s 之后才淡入，留给她自己慢慢下。 */
    "assets/archive-door.webp?v=20260922a",
    "assets/archive-hall.webp?v=20260922j"
  ];
  list.forEach(function (u) {
    var im = new Image();
    im.src = u;
    if (im.decode) im.decode().catch(function () {});   // 失败也无妨：真打开时浏览器会自己再解
  });
}
(function warmGateLater() {
  var go = function () {
    if (window.requestIdleCallback) requestIdleCallback(warmGateImages, { timeout: 2500 });
    else setTimeout(warmGateImages, 900);
  };
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go);
})();

// ---------- 7. 事件绑定 ----------
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

  // 分类空间：返回目录 ＋ 点列表项开文档（事件委托，列表是动态生成的）
  var sb = document.getElementById("ksBack");
  if (sb) sb.addEventListener("click", knShelfBack);
  var sh = document.getElementById("knShelf");
  if (sh) sh.addEventListener("click", function (e) {
    var it = e.target.closest(".ks-item");
    if (!it || it.hasAttribute("disabled")) return;
    var d = knShelfList[+it.getAttribute("data-i")];
    if (d) openKnowledge(d);
  });

  // 门户点击：分类条目 → 打开该分类第一篇；「随机一读」→ 随机翻一篇
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
    // ESC 的层级：门 > 单件详情 > 法则纸 > 独立页 > 修习档案 > 阅读页 > 整个舞台
    // ⚠️ 这五级一律走 `ksRendered`（`hidden=false` 但祖先已 display:none 的不算"开着"），
    //    否则一张看不见的纸／页会白吃掉一次 ESC（见 `ksRendered` 的注释）。
    var kleaf = document.getElementById("ksLeaf");
    if (ksRendered(kleaf)) { ksLeafClose(); return; }
    var klaw = document.getElementById("ksLaw");
    if (ksRendered(klaw)) { kstLawClose(); return; }
    var kpage = document.getElementById("ksPage");
    if (ksRendered(kpage)) { ksPageClose(); return; }
    var kfile = document.getElementById("kstFile");
    if (ksRendered(kfile)) { kstFileClose(); return; }
    // 馆藏原件：调阅台/调阅单开着 → 先收卡纸（回到内厅）；否则退出这一格（回门户）
    if (arcActive()) {
      if (arcCardBack()) return;      // 与"点画面任意处缩回"共用同一条
      knShelfBack();
      return;
    }
    // 技术文库：停在某个部分页 → 先回大厅（五个入口），别一步退出知识文档
    var kthsec = document.getElementById("kthSec");
    if (ksRendered(kthsec)) { kthHome(); return; }
    // 最后才收大厅里那张纸 —— 回到"进场只看见前台对话条"的状态
    var kpaper = document.getElementById("ksta");
    if (ksRendered(kpaper)) { ksPaper(false); return; }
    var st = document.getElementById("knowledgeStage");
    if (st && !st.hidden) {
      var kd = document.getElementById("knowledgeDetail");
      if (ksRendered(kd)) {
        // 详情内 ESC = 回到门户首页
        knBackToHome();
      } else if (ex) {
        ex.click();
      }
    }
  });
})();
