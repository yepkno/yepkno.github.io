// ===== 知识文档 · 同页全屏层（门 → 卡片墙 → 沉浸阅读）=====
// 2026-09-20 新建。知识文档与旅游攻略共用同一套「全屏门 + 卡片墙」的视觉语言与交互
//（复用 .gatewall / .stagewall / .tcard / .detailview 等共享 class），但逻辑独立在本文件，
// 由 index.html 在 app.js 之后引入。
// 依赖 app.js 里已定义的全局工具：sha256 / WALL_HASHES / isDocWallUnlocked /
// setDocWallUnlocked / makeSimplex3D / escapeHtml / getDocCover / cleanTags / buildToc /
// isDocVisible / switchCategory。

// ---------- 1. 波纹背景（独立实例，指向 #knowledgeGateWave）----------
// 与 app.js 的 gateWave 同源（3D simplex 噪声 + 5 条蓝族横带），只换 canvas 目标。
var knowledgeWave = (function () {
  var cv = null, ctx = null, noise = null, raf = 0, running = false;
  var W = 0, H = 0, nt = 0, ready = false, cssBlur = false;
  var REDUCE = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var COLORS = ["#2f7bff", "#5aa9ff", "#22d3ee", "#1d4ed8", "#0b2a6b"];
  var BLUR = 10, LINE_W = 50, LINE_N = 5, OPACITY = 0.5, SPEED = 0.002, MAXW = 1440, FILL = "#040714";

  function setup() {
    if (ready) return true;
    cv = document.getElementById("knowledgeGateWave");
    if (!cv) return false;
    ctx = cv.getContext("2d");
    if (!ctx) return false;
    noise = makeSimplex3D();
    try { ctx.filter = "blur(2px)"; cssBlur = (ctx.filter !== "blur(2px)"); ctx.filter = "none"; }
    catch (e) { cssBlur = true; }
    if (cssBlur) cv.style.filter = "blur(" + BLUR + "px)";
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
  }

  function step() {
    if (!cssBlur) ctx.filter = "none";
    ctx.globalAlpha = OPACITY;
    ctx.fillStyle = FILL;
    ctx.fillRect(0, 0, W, H);
    if (!cssBlur) ctx.filter = "blur(" + BLUR + "px)";
    nt += SPEED;
    for (var i = 0; i < LINE_N; i++) {
      ctx.beginPath();
      ctx.lineWidth = LINE_W;
      ctx.strokeStyle = COLORS[i % COLORS.length];
      for (var x = 0; x < W; x += 5)
        ctx.lineTo(x, noise(x / 800, 0.3 * i, nt) * 100 + H * 0.5 + (i - 2) * 14);
      ctx.stroke();
      ctx.closePath();
    }
  }

  function loop() { step(); raf = requestAnimationFrame(loop); }

  function start() {
    if (!setup()) return;
    size();
    if (REDUCE) { nt = 0.35; step(); return; }
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
function openKnowledgeStage() {
  var st = document.getElementById("knowledgeStage");
  if (!st) return;
  st.hidden = false;
  document.body.style.overflow = "hidden";
  var kd = document.getElementById("knowledgeDetail");
  if (kd) kd.style.display = "none";
  var ws = document.getElementById("knowledgeWallStage");
  if (ws) ws.style.display = "";
  var dl = document.getElementById("docList");
  if (dl) dl.style.display = "none";
  renderKnowledgeWall(knowledgeDocs());
}

function closeKnowledgeStage() {
  var st = document.getElementById("knowledgeStage");
  if (st) st.hidden = true;
  document.body.style.overflow = "";
}

// ---------- 4. 卡片墙 ----------
// 复用旅游攻略卡片墙的「拖动 + 3D 倾斜 + 惯性」交互，但知识文档卡片信息条显示「编号 + 日期」，
// 且详情是沉浸阅读（不是四卡）。
var knowledgeDocsList = [], knowledgeCards = [], knowledgeZTop = 100;

function knowledgeDocs() {
  return (window.DOCS || []).filter(function (d) {
    return d.category === "知识文档" && isDocVisible(d);
  });
}

function kwClamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

function kwIsFlow() {
  var ws = document.getElementById("knowledgeWallStage");
  return !!(ws && ws.classList.contains("wallflow"));
}

function kwBounds(el, home) {
  var w = el.offsetWidth, h = el.offsetHeight;
  var W = home.clientWidth, H = home.clientHeight;
  var mx = Math.round(w / 3), my = Math.round(h / 3);
  return {
    x0: -w + mx, x1: Math.max(-w + mx, W - mx),
    y0: 58, y1: Math.max(58, H - my - 20)
  };
}

function kwApply(el) {
  el.style.setProperty("--x", el.dataset.x + "px");
  el.style.setProperty("--y", el.dataset.y + "px");
  el.style.setProperty("--r", el.dataset.r + "deg");
}

function renderKnowledgeWall(docs) {
  var home = document.getElementById("knowledgeWallStage");
  if (!home) return;
  home.innerHTML = "";
  knowledgeCards = [];
  knowledgeDocsList = docs || [];
  var n = knowledgeDocsList.length;

  var st = document.getElementById("knStats");
  if (st) {
    st.innerHTML =
      "<span>ENTRIES <b>" + String(n).padStart(3, "0") + "</b></span>" +
      "<span>BASE <b>KB</b></span>";
  }

  if (!n) {
    home.innerHTML = '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
                      'color:var(--faint);font-size:13px">这个分类下还没有文档</div>';
    return;
  }

  var W = home.clientWidth, H = home.clientHeight;
  if (!W || !H) return;
  var flow = W <= 600;
  home.classList.toggle("wallflow", flow);
  var hint = document.querySelector("#knowledgeStage .thint");
  if (hint) hint.innerHTML = flow ? "上下滑动浏览 &#183; 点卡片进入阅读"
                                  : "拖动可自由摆放 &#183; 点卡片进入阅读";
  var cw = flow ? Math.min(334, W - 36)
                : Math.min(334, Math.max(188, Math.round(W * 0.225)));
  var ch = cw + 46;

  var SLOTS = [
    { x: .24, y: .04, r: -6 }, { x: .52, y: .26, r: 8 },  { x: .34, y: .46, r: -4 },
    { x: .68, y: .06, r: 10 }, { x: .10, y: .24, r: -9 }, { x: .60, y: .48, r: 5 },
    { x: .42, y: .16, r: -3 }, { x: .82, y: .30, r: 7 },  { x: .18, y: .50, r: -7 },
    { x: .50, y: .02, r: 4 },  { x: .30, y: .30, r: -5 }, { x: .72, y: .44, r: 9 }
  ];
  var padX = 22, padT = 86, padB = 62;
  var ax = Math.max(40, W - cw - padX * 2);
  var ay = Math.max(40, H - ch - padT - padB);
  var pos = [], i2;
  if (flow) {
    for (i2 = 0; i2 < n; i2++) pos.push({ x: 0, y: 0, r: 0 });
  } else {
    for (i2 = 0; i2 < n; i2++) {
      var sl = SLOTS[i2 % SLOTS.length], rd = Math.floor(i2 / SLOTS.length);
      pos.push({ x: padX + sl.x * ax + rd * 15, y: padT + sl.y * ay + rd * 11, r: sl.r });
    }
  }
  if (!flow) {
    var mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity;
    pos.forEach(function (p) {
      mnx = Math.min(mnx, p.x); mxx = Math.max(mxx, p.x + cw);
      mny = Math.min(mny, p.y); mxy = Math.max(mxy, p.y + ch);
    });
    var dx = (W - (mnx + mxx)) / 2, dy = H * 0.50 - (mny + mxy) / 2;
    dx = Math.min(Math.max(dx, padX - mnx), (W - padX) - mxx);
    dy = Math.min(Math.max(dy, padT - mny), (H - padB) - mxy);
    pos.forEach(function (p) { p.x += dx; p.y += dy; });
  }

  knowledgeDocsList.forEach(function (d, i) {
    var el = document.createElement("div");
    el.className = "tcard";
    el.style.width = cw + "px";
    el.style.height = ch + "px";
    el.style.zIndex = String(10 + i);
    el.dataset.x = Math.round(pos[i].x);
    el.dataset.y = Math.round(pos[i].y);
    el.dataset.r = pos[i].r.toFixed(2);
    kwApply(el);
    el.innerHTML =
      '<div class="fc">' +
        '<div class="ph">' +
          '<img src="' + getDocCover(d) + '" alt="" draggable="false" loading="lazy" decoding="async">' +
          '<span class="glare"></span>' +
        '</div>' +
        '<div class="cap">' +
          '<div class="r1">' +
            '<span class="no">' + String(i + 1).padStart(2, "0") + '</span>' +
            '<i class="sep"></i>' +
            '<span class="rg">' + escapeHtml(d.date || "") + '</span>' +
          '</div>' +
          '<div class="nm">' + escapeHtml(d.title) + '</div>' +
        '</div>' +
      '</div>';
    home.appendChild(el);
    knowledgeCards.push(el);
    bindKnowledgeDrag(el, d, home);
  });
}

function bindKnowledgeDrag(el, doc, home) {
  var drag = false, sx = 0, sy = 0, ox = 0, oy = 0, moved = 0, hr = null, hist = [];

  el.addEventListener("pointerenter", function () { hr = home.getBoundingClientRect(); });
  el.addEventListener("dragstart", function (e) { e.preventDefault(); });

  el.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    if (drag) return;
    if (kwIsFlow()) return;
    drag = true; moved = 0;
    sx = e.clientX; sy = e.clientY;
    ox = +el.dataset.x; oy = +el.dataset.y;
    hist = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    el.classList.add("drag");
    el.style.zIndex = String(++knowledgeZTop);
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
    e.preventDefault();
  });

  el.addEventListener("pointermove", function (e) {
    if (!kwIsFlow() && e.pointerType !== "touch") {
      if (!hr) hr = home.getBoundingClientRect();
      var cx = hr.left + (+el.dataset.x) + el.offsetWidth / 2;
      var cy = hr.top + (+el.dataset.y) + el.offsetHeight / 2;
      var dx = e.clientX - cx, dy = e.clientY - cy;
      el.style.setProperty("--ry", kwClamp(dx / 12, -25, 25).toFixed(2) + "deg");
      el.style.setProperty("--rx", kwClamp(-dy / 12, -25, 25).toFixed(2) + "deg");
      el.style.setProperty("--glare", Math.min(0.22, Math.abs(dx) / 1400).toFixed(3));
      el.style.setProperty("--sc", "1.02");
    }
    if (!drag) return;
    var b = kwBounds(el, home);
    el.dataset.x = Math.round(kwClamp(ox + (e.clientX - sx), b.x0, b.x1));
    el.dataset.y = Math.round(kwClamp(oy + (e.clientY - sy), b.y0, b.y1));
    kwApply(el);
    moved = Math.max(moved, Math.sqrt(
      (e.clientX - sx) * (e.clientX - sx) + (e.clientY - sy) * (e.clientY - sy)));
    hist.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (hist.length > 6) hist.shift();
  });

  function kwEnd() {
    if (!drag) return;
    drag = false;
    el.classList.remove("drag");
    var a = hist[0], z = hist[hist.length - 1], dt = z ? z.t - a.t : 0;
    var vx = dt > 0 ? (z.x - a.x) / dt : 0, vy = dt > 0 ? (z.y - a.y) / dt : 0;
    var b = kwBounds(el, home);
    el.dataset.x = Math.round(kwClamp(+el.dataset.x + vx * 260, b.x0, b.x1));
    el.dataset.y = Math.round(kwClamp(+el.dataset.y + vy * 260, b.y0, b.y1));
    kwApply(el);
    hist = [];
  }
  el.addEventListener("pointerup", kwEnd);
  el.addEventListener("pointercancel", kwEnd);
  el.addEventListener("lostpointercapture", kwEnd);

  el.addEventListener("pointerleave", function () {
    if (drag) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--glare", "0");
    el.style.setProperty("--sc", "1");
  });

  el.addEventListener("click", function () {
    if (moved > 6) return;
    openKnowledge(doc);
  });
  el.tabIndex = 0;
  el.setAttribute("role", "button");
  el.setAttribute("aria-label", "打开文档：" + (doc.title || ""));
  el.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openKnowledge(doc); }
  });
}

var _kwRt = null;
window.addEventListener("resize", function () {
  if (_kwRt) clearTimeout(_kwRt);
  _kwRt = setTimeout(function () {
    var ws = document.getElementById("knowledgeWallStage");
    var st = document.getElementById("knowledgeStage");
    if (ws && st && !st.hidden && ws.style.display !== "none" && knowledgeDocsList.length) {
      renderKnowledgeWall(knowledgeDocsList);
    }
  }, 320);
});

// ---------- 5. 沉浸阅读详情 ----------
function openKnowledge(d) {
  document.getElementById("knowledgeWallStage").style.display = "none";
  var kd = document.getElementById("knowledgeDetail");
  kd.style.display = "";
  kd.dataset.idx = String(knowledgeDocsList.indexOf(d));
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

  if (ex) ex.addEventListener("click", function () {
    closeKnowledgeStage();
    var home = document.querySelector('#mainNav a[data-cat="主页"]');
    if (home) home.click();
  });
  if (kb) kb.addEventListener("click", function () {
    // 详情内返回 = 回到卡片墙
    var ws = document.getElementById("knowledgeWallStage");
    if (ws) ws.style.display = "";
    var kd = document.getElementById("knowledgeDetail");
    if (kd) kd.style.display = "none";
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
        // 详情内 ESC = 回到卡片墙
        kd.style.display = "none";
        var ws = document.getElementById("knowledgeWallStage");
        if (ws) ws.style.display = "";
      } else if (ex) {
        ex.click();
      }
    }
  });
})();
