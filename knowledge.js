// ===== 知识文档 · 同页全屏层（门 → 卡片墙 → 沉浸阅读）=====
// 2026-09-20 新建。知识文档与旅游攻略共用同一套「全屏门 + 卡片墙」的视觉语言与交互
//（复用 .gatewall / .stagewall / .tcard / .detailview 等共享 class），但逻辑独立在本文件，
// 由 index.html 在 app.js 之后引入。
// 依赖 app.js 里已定义的全局工具：sha256 / WALL_HASHES / isDocWallUnlocked /
// setDocWallUnlocked / makeSimplex3D / escapeHtml / getDocCover / cleanTags / buildToc /
// isDocVisible / switchCategory。

// ---------- 1. 门的背景动效：学院风「墨韵」（**不复用** app.js 的蓝族波纹）----------
// 暖纸底 + 数团墨色（墨绿 / 鎏金 / 淡墨）在纸上缓慢晕开、漂移，读作宣纸上的淡墨；
// 再撒一层极淡的纸颗粒（纤维感）。算法与配色都与旅游攻略的 gateWave 无关 —— 用户要求不照搬。
var knowledgeWave = (function () {
  var cv = null, ctx = null, noise = null, raf = 0, running = false;
  var W = 0, H = 0, nt = 0, ready = false, grain = null;
  var ripples = [], rippleTick = 0;     // 滴墨：落在纸上的墨点缓缓晕开、淡去
  var REDUCE = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var MAXW = 1440, FILL = "#f8f3e8";   // 与 #knowledgeGate 底色一致（canvas 铺底 + CSS 兜底）
  // 墨团：c=基色 / a=峰值不透明度 / x,y=基准位置(比例) / r=半径系数 / s=漂移速度 / p=呼吸幅度
  var INK = [
    { c: [47, 93, 80], a: .20, x: .20, y: .28, r: .42, s: 1.0, p: .18 },   // 墨绿 · 左上
    { c: [176, 138, 62], a: .18, x: .78, y: .36, r: .34, s: 1.25, p: .15 }, // 鎏金 · 右上
    { c: [72, 82, 92], a: .13, x: .50, y: .74, r: .48, s: 0.8, p: .20 },    // 淡墨 · 下中
    { c: [47, 93, 80], a: .13, x: .10, y: .80, r: .34, s: 1.45, p: .14 }    // 墨绿 · 左下
  ];

  function setup() {
    if (ready) return true;
    cv = document.getElementById("knowledgeGateWave");
    if (!cv) return false;
    ctx = cv.getContext("2d");
    if (!ctx) return false;
    noise = makeSimplex3D();
    ready = true;
    window.addEventListener("resize", function () {
      if (!cv) return;
      size();
      grain = null;                    // 尺寸变了 → 颗粒重新生成
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
  }

  // 纸颗粒：极淡的暖灰小点（一次生成、每帧重画），给纸一点纤维感；不是网格，避免"装饰性网格"味
  function makeGrain() {
    var n = Math.min(900, Math.round(W * H / 4200)), arr = [];
    for (var i = 0; i < n; i++) {
      arr.push([
        Math.random() * W,
        Math.random() * H,
        Math.random() * .6 + .3,        // 边长（px）
        Math.random() * .045 + .012     // 不透明度
      ]);
    }
    return arr;
  }

  function step() {
    // 1) 铺纸底
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = FILL;
    ctx.fillRect(0, 0, W, H);

    // 2) 纸颗粒
    if (!grain) grain = makeGrain();
    ctx.fillStyle = "rgba(122,112,92,1)";
    for (var i = 0; i < grain.length; i++) {
      var g = grain[i];
      ctx.globalAlpha = g[3];
      ctx.fillRect(g[0], g[1], g[2], g[2]);
    }
    ctx.globalAlpha = 1;

    // 3) 墨晕：位置随噪声漂移、半径呼吸式涨落（径向渐变自带柔边，无需 blur）
    nt += 1;
    for (var k = 0; k < INK.length; k++) {
      var b = INK[k], t = nt * .0018 * b.s;
      var nx = noise(k * 5.1 + 1.7, 0.3, t);
      var ny = noise(k * 5.1 + 8.3, 1.1, t);
      var nr = noise(k * 5.1 + 3.9, 2.7, t * .8);
      var x = (b.x + nx * .10) * W;
      var y = (b.y + ny * .09) * H;
      var rad = Math.max(20, b.r * Math.min(W, H) * (1 + nr * b.p));
      var gd = ctx.createRadialGradient(x, y, 0, x, y, rad);
      gd.addColorStop(0, "rgba(" + b.c[0] + "," + b.c[1] + "," + b.c[2] + "," + b.a + ")");
      gd.addColorStop(1, "rgba(" + b.c[0] + "," + b.c[1] + "," + b.c[2] + ",0)");
      ctx.fillStyle = gd;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, 6.2832);
      ctx.fill();
    }

    // 4) 滴墨涟漪：每隔约 2.5s 在纸上落一滴墨，晕开成两圈后淡去（宣纸滴墨的手感）
    rippleTick++;
    if (rippleTick > 118 && ripples.length < 6) {
      rippleTick = 0;
      ripples.push({
        x: (.14 + Math.random() * .72) * W,
        y: (.14 + Math.random() * .72) * H,
        life: 0
      });
    }
    for (var r = ripples.length - 1; r >= 0; r--) {
      var rp = ripples[r];
      rp.life += .0042;
      if (rp.life >= 1) { ripples.splice(r, 1); continue; }
      var fade = 1 - rp.life;
      var r1 = 6 + rp.life * Math.min(W, H) * .16;
      ctx.strokeStyle = "rgba(47,93,80," + (.17 * fade) + ")";
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(rp.x, rp.y, r1, 0, 6.2832); ctx.stroke();
      // 外圈：错开 1/3 生命周期，形成"晕开的一层水痕"
      if (rp.life > .28) {
        var l2 = (rp.life - .28) / .72;
        ctx.strokeStyle = "rgba(176,138,62," + (.13 * (1 - l2)) + ")";
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, 6 + l2 * Math.min(W, H) * .22, 0, 6.2832);
        ctx.stroke();
      }
    }
  }

  function loop() { step(); raf = requestAnimationFrame(loop); }

  function start() {
    if (!setup()) return;
    size();
    grain = null;
    ripples = []; rippleTick = 0;              // 每次开门都从"干净的纸"开始
    if (REDUCE) { nt = 40; step(); return; }   // 尊重"减少动效"：只画一帧静态墨
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
