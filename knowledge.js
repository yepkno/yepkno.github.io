// ===== 知识文档 · 同页全屏层（门 → 卡片墙 → 沉浸阅读）=====
// 2026-09-20 新建。知识文档与旅游攻略共用同一套「全屏门 + 卡片墙」的视觉语言与交互
//（复用 .gatewall / .stagewall / .tcard / .detailview 等共享 class），但逻辑独立在本文件，
// 由 index.html 在 app.js 之后引入。
// 依赖 app.js 里已定义的全局工具：sha256 / WALL_HASHES / isDocWallUnlocked /
// setDocWallUnlocked / makeSimplex3D / escapeHtml / getDocCover / cleanTags / buildToc /
// isDocVisible / switchCategory。

// ---------- 1. 门的背景动效：学院风「水墨」（**不复用** app.js 的蓝族波纹）----------
// 2026-09-20 二次升级（用户："特效有点太简单了"）：从"几团墨 + 几颗灰"升级为一套水墨系统 ——
//   ① 底色墨晕：5 团墨（墨绿/鎏金/淡墨）缓慢漂移、呼吸涨落
//   ② **墨滴绽放**：墨点落在纸上，边缘按 simplex 噪声不规则地晕开，并从墨心抽出墨丝
//   ③ **描金藤蔓自绘**：金线一圈圈卷出藤枝，沿途生叶，画完停留再淡去（四角轮转）
//   ④ **跟手墨迹**：鼠标处一团柔和墨晕跟随，快速移动时拖出细小墨花
//   ⑤ 纸颗粒（预渲染贴图，不再每帧画近千个方块）＋ 浮尘（缓缓上浮的金/墨小点）
// ⚠️ canvas 已改为**透明**：纸底由 CSS `.gatewall` 给、书卷插画由 `.gdeco` 给。
//    所以 DOM 里 `.gdeco` **必须排在 canvas 之前**，墨才会画在插画之上（否则被 15.5% 的插画蒙住）。
// ⚠️ 性能：所有软边元素都走"预渲染贴图 + drawImage"；每帧只留 1～2 个 createRadialGradient。
// ⚠️ 合成模式一律 source-over（不用 multiply）：透明画布上 multiply 的行为不直观，
//    半透明墨直接叠在 CSS 纸底上更可控。
var knowledgeWave = (function () {
  var cv = null, ctx = null, noise = null, raf = 0, running = false;
  var W = 0, H = 0, nt = 0, ready = false, k = 1;          // k = 画布像素 / CSS 像素
  var REDUCE = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var MAXW = 1440;
  var paper = null;                      // 预渲染的纸颗粒层
  var sprites = {};                      // 软边贴图缓存
  var washes = [], blooms = [], flourishes = [], specks = [];
  var bloomGap = 0, flourishGap = 0, flourishIdx = 0;
  var mx = -9999, my = -9999, ax = -9999, ay = -9999, aura = 0, trailGap = 0, lastMx = -9999, lastMy = -9999;

  var INK_C = [47, 93, 80];              // 墨绿
  var GOLD_C = [176, 138, 62];           // 鎏金
  var GREY_C = [96, 86, 70];             // 淡墨（暖褐灰；原来是偏蓝的灰，压在暖纸上发脏）

  // 底色墨团：c=基色 / a=峰值不透明度 / x,y=基准位置(比例) / r=半径系数 / s=漂移速度 / p=呼吸幅度
  var INK = [
    { c: INK_C, a: .26, x: .20, y: .28, r: .42, s: 1.0, p: .18 },
    { c: GOLD_C, a: .22, x: .78, y: .36, r: .34, s: 1.25, p: .15 },
    { c: GREY_C, a: .17, x: .50, y: .74, r: .48, s: 0.8, p: .20 },
    { c: INK_C, a: .17, x: .10, y: .80, r: .34, s: 1.45, p: .14 },
    { c: GOLD_C, a: .15, x: .88, y: .80, r: .30, s: 1.1, p: .16 }
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

  // 浮尘：极小墨点/金点在纸上缓缓上浮、轻摆、明灭
  function makeSpecks() {
    var n = Math.min(48, Math.max(16, Math.round(W * H / 24000))), arr = [];
    for (var i = 0; i < n; i++) {
      arr.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.5 + .6, v: Math.random() * .22 + .08,
        a: Math.random() * .15 + .06, ph: Math.random() * 6.2832,
        sw: Math.random() * .7 + .3, gold: Math.random() < .42
      });
    }
    return arr;
  }

  // ---- 墨滴绽放 ----
  function spawnBloom(x, y, rad, color) {
    var m = 8 + Math.round(Math.random() * 6), tend = [];
    for (var i = 0; i < m; i++) {
      tend.push({
        a: i / m * 6.2832 + Math.random() * .5,
        l: (.9 + Math.random() * 2.2) * rad,   // 墨丝要明显伸出墨缘，才算"渗开"
        w: .6 + Math.random() * 1.2,
        cv: (Math.random() - .5) * 1.4
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
    gd.addColorStop(0, "rgba(" + cs + "," + (.03 * life) + ")");
    gd.addColorStop(.32, "rgba(" + cs + "," + (.04 * life) + ")");
    gd.addColorStop(.70, "rgba(" + cs + "," + (.075 * life) + ")");
    gd.addColorStop(.90, "rgba(" + cs + "," + (.24 * life) + ")");   // 湿边
    gd.addColorStop(1, "rgba(" + cs + ",0)");
    ctx.fillStyle = gd;
    ctx.fill();

    // 扩散环：墨落下后向外推的两圈水痕（只在前半程出现，形状跟着墨缘走）
    if (t > .10 && t < .62) {
      for (var rg = 0; rg < 2; rg++) {
        var rt = (t - .10 - rg * .11) / .42;
        if (rt <= 0 || rt >= 1) continue;
        ctx.strokeStyle = "rgba(" + cs + "," + (.16 * (1 - rt) * life) + ")";
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
        ctx.strokeStyle = "rgba(" + cs + "," + (.18 * fad * len) + ")";
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
      ctx.globalAlpha = .34 * (1 - t / .26);
      ctx.drawImage(sprite("core" + cs, b.c, 64), b.x - core, b.y - core, core * 2, core * 2);
      ctx.globalAlpha = 1;
    }
  }

  // ---- 描金藤蔓（自绘）----
  // 四角轮转出枝：一条半径渐收的螺旋 + 沿途交替生出的小叶。
  var FSPOT = [[.17, .78], [.83, .22], [.19, .22], [.81, .78]];
  function spawnFlourish() {
    var sp = FSPOT[flourishIdx % FSPOT.length];
    flourishIdx++;
    var dir = flourishIdx % 2 ? 1 : -1;
    var cx = sp[0] * W, cy = sp[1] * H, R = Math.min(W, H) * .135;
    var pts = [], i, t, ang, rr;
    for (i = 0; i <= 72; i++) {
      t = i / 72;
      // 0.72 圈（≈260°）的舒展弧 + 半径缓收 —— 读作"一枝卷曲的藤"，不是闭合的圆圈
      //（初版是 1.25 圈的螺旋，截图上像一枚"咖啡渍圆环"，已改）
      ang = dir * (t * 6.2832 * .72);
      rr = R * (1 - t * .42);
      pts.push([cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr * .78 - dir * t * 12]);
    }
    var leaves = [];
    for (i = 8; i < 70; i += 7) leaves.push({ i: i, s: (i % 14 === 8 ? 1 : -1) });
    flourishes.push({ pts: pts, leaves: leaves, t: 0 });
    if (flourishes.length > 2) flourishes.shift();
  }

  function drawFlourish(f) {
    var prog = f.t < .55 ? f.t / .55 : 1;
    var fade = f.t < .78 ? 1 : 1 - (f.t - .78) / .22;
    if (fade <= 0) return;
    var n = Math.max(2, Math.round(f.pts.length * prog));
    var s = "176,138,62";
    ctx.strokeStyle = "rgba(" + s + "," + (.62 * fade) + ")";
    ctx.lineWidth = 1.4;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(f.pts[0][0], f.pts[0][1]);
    for (var i = 1; i < n; i++) ctx.lineTo(f.pts[i][0], f.pts[i][1]);
    ctx.stroke();
    // 叶：沿线交替生出的细长叶片（两段二次曲线合拢成一片）
    ctx.fillStyle = "rgba(" + s + "," + (.34 * fade) + ")";
    for (var j = 0; j < f.leaves.length; j++) {
      var lf = f.leaves[j];
      if (lf.i > n - 1) continue;
      var p = f.pts[lf.i], pn = f.pts[Math.min(f.pts.length - 1, lf.i + 1)];
      var ag = Math.atan2(pn[1] - p[1], pn[0] - p[0]);
      var nx = Math.cos(ag + lf.s * 1.5708), ny = Math.sin(ag + lf.s * 1.5708);
      var L = 10;
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.quadraticCurveTo(p[0] + nx * L * .8 + Math.cos(ag) * L * .5,
                           p[1] + ny * L * .8 + Math.sin(ag) * L * .5,
                           p[0] + nx * L * 1.5 + Math.cos(ag) * L,
                           p[1] + ny * L * 1.5 + Math.sin(ag) * L);
      ctx.quadraticCurveTo(p[0] + nx * L * .8 - Math.cos(ag) * L * .5,
                           p[1] + ny * L * .8 - Math.sin(ag) * L * .5,
                           p[0], p[1]);
      ctx.fill();
    }
  }

  // ---- 沿金框游走的一道描金流光 ----
  // 一段约 40% 框长的金色光带沿证书内框缓缓绕行（约 15s 一圈），两端渐隐（彗尾）。
  // 这是"一眼能看出有特效"的那一件：静帧看得见，动起来像镀金边框上跑着的光。
  var gilt = 0, frameRect = null;
  function measureFrame() {
    var f = document.querySelector("#knowledgeGate .gframe");
    if (!f) { frameRect = null; return; }
    var r = f.getBoundingClientRect();
    if (!r.width) { frameRect = null; return; }     // 门关着时拿到的是 0
    frameRect = { x: r.left * k, y: r.top * k, w: r.width * k, h: r.height * k };
  }
  function perimPoint(d) {
    var f = frameRect, w = f.w, h = f.h;
    if (d < w) return [f.x + d, f.y];               // 上边 →
    d -= w;
    if (d < h) return [f.x + w, f.y + d];           // 右边 ↓
    d -= h;
    if (d < w) return [f.x + w - d, f.y + h];       // 下边 ←
    d -= w;
    return [f.x, f.y + h - d];                      // 左边 ↑
  }
  function drawGilt() {
    if (!frameRect || !frameRect.w) return;
    var P = 2 * (frameRect.w + frameRect.h);
    var L = Math.min(P * .26, 420), N = 44;
    var s = (gilt % 1) * P, pts = [], i;
    for (i = 0; i <= N; i++) pts.push(perimPoint((s + L * i / N) % P));
    ctx.lineCap = "round";
    for (i = 0; i < N; i++) {
      var f2 = Math.sin(Math.PI * (i + .5) / N);    // 两端渐隐 → 彗尾
      ctx.strokeStyle = "rgba(176,138,62," + (.6 * f2 * f2) + ")";
      ctx.lineWidth = 1.1 + 1.6 * f2;
      ctx.beginPath();
      ctx.moveTo(pts[i][0], pts[i][1]);
      ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
      ctx.stroke();
    }
    var hd = perimPoint((s + L * .82) % P);          // 头部一点柔光
    var gr = Math.min(frameRect.w, frameRect.h) * .1;
    ctx.globalAlpha = .34;
    ctx.drawImage(sprite("gilt", GOLD_C, CANON), hd[0] - gr, hd[1] - gr, gr * 2, gr * 2);
    ctx.globalAlpha = 1;
  }

  // ---- 鼠标：跟手墨晕 + 拖尾墨花 ----
  function onMove(e) {
    if (!cv) return;
    mx = e.clientX * k; my = e.clientY * k;
    if (REDUCE) return;
    trailGap++;
    var dx = mx - lastMx, dy = my - lastMy;
    if (trailGap > 4 && (dx * dx + dy * dy) > 900) {
      trailGap = 0; lastMx = mx; lastMy = my;
      spawnBloom(mx, my, Math.min(W, H) * .022 + Math.random() * 10,
                 Math.random() < .35 ? GOLD_C : INK_C);
    }
  }
  function onDown(e) {
    if (!cv || REDUCE) return;
    spawnBloom(e.clientX * k, e.clientY * k, Math.min(W, H) * .07, INK_C);
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
      measureFrame();                  // 金框位置跟着变
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
    specks = [];                         // 浮尘按旧尺寸算的，一并重来
    flourishes = [];                     // 藤蔓位置也是按旧尺寸算的
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

    // ② 墨滴绽放
    for (var m = blooms.length - 1; m >= 0; m--) {
      var bl = blooms[m];
      bl.t += .0072;
      if (bl.t >= 1) { blooms.splice(m, 1); continue; }
      drawBloom(bl);
    }
    bloomGap++;
    if (bloomGap > 92) {                  // 约 1.5s 落一滴（小而多，比一大坨像墨）
      bloomGap = 0;
      // 落点避开正中央那一块（大字与输入行在那里），也避开上下两条纸色带，走中环
      var ang = Math.random() * 6.2832, rr = .15 + Math.random() * .17;
      var bx = W * (.5 + Math.cos(ang) * rr * 1.6);
      var by = H * (.5 + Math.sin(ang) * rr);
      var roll = Math.random();
      spawnBloom(bx, by, Math.min(W, H) * (.045 + Math.random() * .055),
                 roll < .16 ? GOLD_C : (roll < .58 ? INK_C : GREY_C));
    }

    // ③ 描金藤蔓自绘（约 5.5s 一枝）
    for (var f = flourishes.length - 1; f >= 0; f--) {
      var fl = flourishes[f];
      fl.t += .0055;
      if (fl.t >= 1) { flourishes.splice(f, 1); continue; }
      drawFlourish(fl);
    }
    flourishGap++;
    if (flourishGap > 330) { flourishGap = 0; spawnFlourish(); }

    // 描金流光（沿证书内框绕行；"减少动效"时不动，静帧靠墨与藤撑着）
    if (!REDUCE) {
      if (!frameRect) measureFrame();   // 门刚显示时可能量到 0，这里补量；量到就不再来
      gilt += .0011;
      drawGilt();
    }

    // ⑤ 浮尘：缓缓上浮的小点（越顶回到底部），横向轻摆 + 明灭
    if (!specks.length) specks = makeSpecks();
    for (var s = 0; s < specks.length; s++) {
      var sp = specks[s];
      sp.y -= sp.v;
      if (sp.y < -6) { sp.y = H + 6; sp.x = Math.random() * W; }
      sp.ph += .012;
      var sx = sp.x + Math.sin(sp.ph) * sp.sw * 14;
      var pulse = .55 + .45 * Math.sin(sp.ph * 1.7);
      ctx.fillStyle = sp.gold ? "rgba(176,138,62," + (sp.a * pulse) + ")"
                              : "rgba(47,93,80," + (sp.a * pulse) + ")";
      ctx.beginPath();
      ctx.arc(sx, sp.y, sp.r, 0, 6.2832);
      ctx.fill();
    }
  }

  function loop() { step(); raf = requestAnimationFrame(loop); }

  function start() {
    if (!setup()) return;
    size();
    measureFrame();                        // 量一次金框的实际位置（给描金流光用）
    gilt = 0;
    blooms = []; flourishes = []; specks = [];
    bloomGap = 60; flourishGap = 210;      // 开门后很快就有第一滴墨、第一枝藤
    mx = my = ax = ay = -9999; aura = 0; lastMx = lastMy = -9999; trailGap = 0;
    // 开门第一拍：先落一滴墨（不等计时器），门一露面就有动的东西
    spawnBloom(W * (.5 + (Math.random() < .5 ? -.24 : .24) * 1.6), H * .62,
               Math.min(W, H) * .07, INK_C);
    if (REDUCE) {                          // 尊重"减少动效"：只画一帧静态水墨
      nt = 40;
      spawnBloom(W * .26, H * .32, Math.min(W, H) * .075, INK_C);
      spawnBloom(W * .75, H * .68, Math.min(W, H) * .06, GREY_C);
      blooms.forEach(function (b) { b.t = .34; });
      spawnFlourish();
      flourishes.forEach(function (f) { f.t = .6; });
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
  return { start: start, stop: stop };
})();

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
  g.classList.remove("enter", "leaving", "ok", "wrong");
  g.hidden = false;
  void g.offsetWidth;
  g.classList.add("enter");
  document.body.style.overflow = "hidden";
  knowledgeWave.start();
  setTimeout(function () { if (inp) inp.focus(); }, 980);
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
