// ===== 教学文档库 核心逻辑（博客风格版）=====

// 密码配置：修改 PASSWORD_HASH 即可更换密码（密码本身不在任何文件中明文出现）
var PASSWORD_HASH = "78e49ff8d5e7c92fc230fc30a01f274c5d9a83ce50f122c4d79e9c25e824fb31";

// 栏目密码墙：每个受限栏目各有独立密码、独立解锁状态；解锁后本会话内自由浏览该栏目（只存哈希，明文不落任何文件）
var WALL_HASHES = {
  "知识文档": "e0f895872d65b2528feec97350a3a212b3d4ab88748e25d022a34641d338216b",
  "旅游攻略": "cd50fc998e7e535b8908c8efc8233cfc25ffa79ed9067abf1ebd32c52ffc87df",
  "游戏资源": "3f1f29444c093e2890d2163174cce5d5db40386b84168e015ec9da46cff1a6f9"
};
function isWallCategory(cat) {
  return Object.prototype.hasOwnProperty.call(WALL_HASHES, cat);
}

// 简易 SHA-256（纯前端，无外部依赖）
function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = "length";
  var i, j;
  var result = "";
  var words = [];
  var asciiBitLength = ascii[lengthProperty] * 8;

  var hash = (sha256.h = sha256.h || []);
  var k = (sha256.k = sha256.k || []);
  var primeCounter = k[lengthProperty];

  var isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += "\x80";
  while ((ascii[lengthProperty] % 64) - 56) ascii += "\x00";
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return "";
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    var w = words.slice(j, (j += 16));
    var oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      var w15 = w[i - 15], w2 = w[i - 2];
      var a = hash[0], e = hash[4];
      var temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      var temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [
        (temp1 + temp2) | 0,
        hash[0],
        hash[1],
        hash[2],
        (hash[3] + temp1) | 0,
        hash[4],
        hash[5],
        hash[6],
      ];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      var b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
  }
  return result;
}

// 登录状态
function isUnlocked() {
  return sessionStorage.getItem("eo_docs_unlocked") === "1";
}
function setUnlocked() {
  sessionStorage.setItem("eo_docs_unlocked", "1");
}

// 栏目密码墙解锁状态：按栏目分别记录（本次会话内有效）
function isDocWallUnlocked(cat) {
  return sessionStorage.getItem("eo_docwall::" + cat) === "1";
}
function setDocWallUnlocked(cat) {
  sessionStorage.setItem("eo_docwall::" + cat, "1");
}

// 当前过滤状态
var activeTag = null;
var activeCategory = "主页";
var searchKeyword = "";

// ===== 主题切换 =====
function initTheme() {
  var saved = localStorage.getItem("site_theme");
  if (saved === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }
  document.getElementById("themeToggle").addEventListener("click", function () {
    var el = document.documentElement;
    var isDark = el.getAttribute("data-theme") === "dark";
    if (isDark) {
      el.removeAttribute("data-theme");
      localStorage.setItem("site_theme", "light");
    } else {
      el.setAttribute("data-theme", "dark");
      localStorage.setItem("site_theme", "dark");
    }
  });
}

// ===== 站点信息 =====
function initSiteInfo() {
  var site = window.SITE || {};
  if (site.name) document.getElementById("siteName").textContent = site.name;
  if (site.desc) document.getElementById("siteDesc").textContent = site.desc;
  if (site.avatar) document.getElementById("siteAvatar").src = site.avatar;
  document.title = site.name || "叶の个人数据库";
}

// ===== 页面初始化 =====
// ===== 右下角悬浮播放器（自绘 UI + 自管 Audio 引擎 + 可拖动）=====
// 2026-09-18 换皮 + 修 4 个 bug：
//  ① 上/下一首图标方向修正（旧 next 图标的三角实际朝左 → 与 prev 混淆）；
//  ② 弃用 APlayer：其 list.switch() 是「先 trigger('listswitch') 再更新 this.index」，
//     事件回调里读 ap.list.index 拿到旧值 → 歌名不刷新、要点两次。改为自管 <audio>，彻底可控；
//  ③ 播放顺序改成「顺序 / 列表循环 / 单曲循环」三态，**当前态永远高亮 + 文字标注**（不再出现"默认不亮"）；
//  ④ 进站自动播放 Bones：先尝试直接播放，被浏览器拦截则监听首次交互（点击/按键）后再播。
function initPlayer() {
  var raw = (window.MUSIC && window.MUSIC.list) || [];
  var fix = document.getElementById("playerFix");
  if (!raw.length || !fix) return;

  // 音频地址以 base64(反转(url)) 存储 —— 站点/仓库中不出现音频源域名，播放前在此解码
  var list = raw.map(function (it) {
    var url = "";
    try { url = atob(it.src).split("").reverse().join(""); } catch (e) { url = ""; }
    return { name: it.name, artist: it.artist, cover: it.cover || "assets/music-cover.jpg", url: url };
  });

  var DEFAULT_INDEX = 0;            // 进站默认曲目：Bones
  var VOLUME = 0.5;
  var REPEAT_LABEL = ["顺序", "列表", "单曲"];

  var audio = new Audio();
  audio.preload = "metadata";
  audio.volume = VOLUME;

  var idx = DEFAULT_INDEX;
  var repeat = 1;                   // 0=顺序播放（末曲即停） 1=列表循环（默认） 2=单曲循环
  var shuffle = false;
  var muted = false, lastVol = VOLUME;
  var durations = [];

  function $(s) { return fix.querySelector(s); }
  // 判断某次点击是否来自播放器内部。必须用 composedPath()：
  // 点歌单条目会触发 renderList() 重建列表，被点的节点在 click 冒泡到 document 时
  // 已经脱离文档，此时 fix.contains(e.target) 会误判为 false（→ 面板被误收起）。
  function inPlayer(e) {
    var path = (e.composedPath && e.composedPath()) || [];
    return path.indexOf(fix) !== -1 || fix.contains(e.target);
  }
  function fmt(s) {
    if (!s || isNaN(s) || !isFinite(s)) return "00:00";
    s = Math.floor(s);
    var m = Math.floor(s / 60), r = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r;
  }

  // ---------------- 渲染 ----------------
  function renderNow() {
    var cur = list[idx] || {};
    $("#pTitle").textContent = cur.name || "—";
    $("#pArtist").textContent = cur.artist || "—";
    if ($("#pCover").getAttribute("src") !== cur.cover) $("#pCover").setAttribute("src", cur.cover);
    if ($("#pCoverMini").getAttribute("src") !== cur.cover) $("#pCoverMini").setAttribute("src", cur.cover);
  }
  function renderList() {
    var box = $("#pListBox");
    box.innerHTML = "";
    list.forEach(function (s, i) {
      var it = document.createElement("div");
      it.className = "pl-item" + (i === idx ? " cur" : "");
      it.innerHTML =
        '<span class="pl-mark">' + (i === idx ? "▶" : "") + "</span>" +
        '<span class="pl-thumb"><img src="' + escapeHtml(s.cover) + '" alt=""></span>' +
        '<span class="pl-meta"><b>' + escapeHtml(s.name) + "</b><em>" + escapeHtml(s.artist || "") + "</em></span>" +
        '<span class="pl-dur">' + (durations[i] || "--:--") + "</span>";
      it.addEventListener("click", function () { load(i, true); });
      box.appendChild(it);
    });
    $("#pListN").textContent = "(" + list.length + ")";
  }
  function renderBar() {
    var t = audio.currentTime || 0, d = audio.duration || 0;
    $("#pCur").textContent = fmt(t);
    $("#pDur").textContent = fmt(d);
    var pct = d ? (t / d * 100) : 0;
    $("#pBarFill").style.width = pct + "%";
    $("#pBarDot").style.left = pct + "%";
    $("#pDisc").style.setProperty("--pp-rot", pct);   // 收起态圆盘外圈的进度环
  }
  function renderState() {
    var on = !audio.paused && !audio.ended;
    fix.classList.toggle("playing", on);
    $("#pMiniIcon").textContent = on ? "❚❚" : "▶";
    // ③ 当前播放顺序永远可见：文字写明 + 图标高亮（不再有"默认不亮"的歧义）
    $("#pRepeatT").textContent = REPEAT_LABEL[repeat];
    $("#pRepeat").classList.add("on");
    $("#pRepeat").setAttribute("title", "播放顺序：" + REPEAT_LABEL[repeat] + "（点击切换 顺序 / 列表 / 单曲）");
    $("#pShuffle").classList.toggle("on", shuffle);
    $("#pMute").classList.toggle("on", muted);
    var mute = $("#pMute");
    mute.querySelector("svg").style.display = muted ? "none" : "block";
    mute.querySelector("svg.st").style.display = muted ? "block" : "none";
    mute.setAttribute("title", muted ? "取消静音" : "静音");
  }

  // ---------------- 播放 ----------------
  function load(i, autoplay) {
    idx = ((i % list.length) + list.length) % list.length;
    audio.src = list[idx].url;
    try { audio.load(); } catch (e) {}
    renderNow(); renderList(); renderBar();
    if (autoplay) tryPlay();
  }
  function tryPlay() {
    var p = audio.play();
    if (p && p.catch) p.catch(function () { armPlayOnGesture(); });
  }
  function togglePlay() { if (audio.paused) tryPlay(); else audio.pause(); }
  function step(dir, isAuto) {
    if (shuffle && list.length > 1 && dir > 0) {
      var n;
      do { n = Math.floor(Math.random() * list.length); } while (n === idx);
      load(n, true); return;
    }
    if (isAuto && repeat === 0 && idx === list.length - 1) { renderState(); return; }  // 顺序播放：末曲停
    load(idx + dir, true);
  }
  function updateDuration() {
    if (audio.duration && isFinite(audio.duration)) {
      durations[idx] = fmt(audio.duration);
      renderList();
    }
  }

  // ④ 进站自动播放被拦截时：等首次交互再播（一次性）
  var armed = false;
  function armPlayOnGesture() {
    if (armed) return;
    armed = true;
    function go() {
      document.removeEventListener("pointerdown", go, true);
      document.removeEventListener("keydown", go, true);
      armed = false;
      tryPlay();
    }
    document.addEventListener("pointerdown", go, true);
    document.addEventListener("keydown", go, true);
  }

  // ---------------- 事件 ----------------
  audio.addEventListener("timeupdate", renderBar);
  audio.addEventListener("loadedmetadata", function () { updateDuration(); renderBar(); });
  audio.addEventListener("durationchange", function () { updateDuration(); renderBar(); });
  audio.addEventListener("play", renderState);
  audio.addEventListener("pause", renderState);
  audio.addEventListener("ended", function () {
    if (repeat === 2) { audio.currentTime = 0; tryPlay(); return; }   // 单曲循环
    step(1, true);
  });

  $("#pPlay").addEventListener("click", togglePlay);
  $("#pMiniPlay").addEventListener("click", function (e) { e.stopPropagation(); togglePlay(); });
  $("#pPrev").addEventListener("click", function () {
    if (audio.currentTime > 3) { audio.currentTime = 0; renderBar(); return; }  // 播放超 3 秒：先回本曲开头
    step(-1, false);
  });
  $("#pNext").addEventListener("click", function () { step(1, false); });
  $("#pShuffle").addEventListener("click", function () { shuffle = !shuffle; renderState(); });
  $("#pRepeat").addEventListener("click", function () { repeat = (repeat + 1) % 3; renderState(); });

  // （收藏功能与 ⋯ 更多菜单已移除；静音 = 顶栏一个独立小按钮）

  // 音量 / 静音
  function setMute(on) {
    muted = on;
    if (on) { lastVol = audio.volume || VOLUME; audio.volume = 0; }
    else { audio.volume = lastVol || VOLUME; }
    $("#pVol").value = audio.volume;
    renderState();
  }
  $("#pMute").addEventListener("click", function () { setMute(!muted); });
  $("#pVol").addEventListener("input", function () {
    audio.volume = Number(this.value);
    muted = audio.volume === 0;
    if (!muted) lastVol = audio.volume;
    renderState();
  });

  // 进度条点击跳转
  $("#pBar").addEventListener("click", function (e) {
    if (!audio.duration) return;
    var r = this.getBoundingClientRect();
    var ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    audio.currentTime = ratio * audio.duration;
    renderBar();
  });

  // 播放列表展开 / 收起
  $("#pListHead").addEventListener("click", function () {
    $("#pListWrap").classList.toggle("open");
  });

  // 收起 / 展开
  function snapToEdge() {
    var w = fix.offsetWidth, h = fix.offsetHeight;
    var r = fix.getBoundingClientRect();
    var nx = (r.left + w / 2 < window.innerWidth / 2) ? 12 : (window.innerWidth - w - 12);
    var ny = Math.max(10, Math.min(r.top, window.innerHeight - h - 10));
    fix.style.left = nx + "px"; fix.style.top = ny + "px";
    fix.style.right = "auto"; fix.style.bottom = "auto";
    try { localStorage.setItem("playerPos2", JSON.stringify({ x: nx, y: ny })); } catch (e) {}
  }
  function collapse() { fix.classList.add("collapsed"); snapToEdge(); }
  function expand() { fix.classList.remove("collapsed"); snapToEdge(); }
  $("#pCollapse").addEventListener("click", function () { collapse(); });

  // 防抓链：禁右键 / 禁拖拽素材
  fix.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  fix.addEventListener("dragstart", function (e) { e.preventDefault(); });

  // ---------------- 拖动 / 贴边吸附 / 位置记忆 ----------------
  var dragging = false, moved = false, downInDisc = false, sx = 0, sy = 0, ox = 0, oy = 0;
  fix.addEventListener("pointerdown", function (e) {
    // 记下"这次按下是否落在收起态圆盘的主体上"（排除圆盘上的播放小按钮）
    downInDisc = !!(e.target.closest && e.target.closest("#pDisc")) &&
                 !(e.target.closest && e.target.closest(".pdisc-play"));
    if (e.target.closest("button,input,.plist,.pbar,.pmenu")) return;   // 交互控件不参与拖动
    dragging = true; moved = false;
    var r = fix.getBoundingClientRect();
    sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top;
    fix.classList.add("dragging");
    try { fix.setPointerCapture(e.pointerId); } catch (err) {}
  });
  fix.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
    fix.style.left = (ox + dx) + "px";
    fix.style.top = (oy + dy) + "px";
    fix.style.right = "auto"; fix.style.bottom = "auto";
  });
  function endDrag() {
    if (!dragging) { downInDisc = false; return; }
    dragging = false;
    fix.classList.remove("dragging");
    snapToEdge();
    // 收起态：在圆盘上「按下 → 松开且没拖动」= 点击 → 展开。
    // 不能依赖 click 事件：上面的 setPointerCapture() 会把 click 的 target 改到捕获元素上，
    // 圆盘自身的 click 处理器根本不会执行（2026-09-18 由 playwright 实测抓到）。
    if (downInDisc && !moved) expand();
    downInDisc = false;
  }
  fix.addEventListener("pointerup", endDrag);
  fix.addEventListener("pointercancel", endDrag);

  // 自动收起：鼠标离开面板 5 秒 / 点击播放器外部
  var hideTimer = null;
  function startHide() { stopHide(); hideTimer = setTimeout(collapse, 5000); }
  function stopHide() { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } }
  fix.addEventListener("mouseenter", stopHide);
  fix.addEventListener("mouseleave", function () {
    if (!fix.classList.contains("collapsed")) startHide();
  });
  document.addEventListener("click", function (e) { if (!inPlayer(e)) collapse(); });

  // 恢复上次位置（并按当前收起/展开宽度重新贴边）
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem("playerPos2") || "null"); } catch (e) { saved = null; }
  if (saved && saved.x != null && saved.y != null) {
    fix.style.left = saved.x + "px"; fix.style.top = saved.y + "px";
    fix.style.right = "auto"; fix.style.bottom = "auto";
    snapToEdge();
  }

  // ---------------- 初始化 ----------------
  renderNow(); renderList(); renderBar(); renderState();
  load(DEFAULT_INDEX, true);   // ④ 进站自动播放 Bones（被拦截则等首次交互）
}

document.addEventListener("DOMContentLoaded", function () {
  initTheme();
  initSiteInfo();
  initPlayer();

  var gate = document.getElementById("gate");
  var pwdInput = document.getElementById("pwdInput");
  var errMsg = document.getElementById("errMsg");

  if (isUnlocked()) {
    gate.style.display = "none";
    renderAll();
  }

  document.getElementById("unlockBtn").addEventListener("click", tryUnlock);
  pwdInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") tryUnlock();
  });

  function tryUnlock() {
    var pwd = pwdInput.value.trim();
    pwd = pwd.replace(/[\uFF01-\uFF5E]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
    });
    if (!pwd) {
      errMsg.textContent = "请输入密码";
      return;
    }
    if (sha256(pwd) === PASSWORD_HASH) {
      setUnlocked();
      errMsg.textContent = "";
      gate.style.display = "none";
      renderAll();
    } else {
      errMsg.textContent = "密码错误，请重试";
      pwdInput.value = "";
      pwdInput.focus();
    }
  }

  // 搜索
  document.getElementById("searchInput").addEventListener("input", function (e) {
    searchKeyword = e.target.value.trim().toLowerCase();
    renderCards();
  });

  // 导航（分类切换）：受保护分类需先过密码墙，解锁后本会话内自由浏览
  document.getElementById("mainNav").addEventListener("click", function (e) {
    var item = e.target.closest("a[data-cat]");
    if (!item) return;
    var cat = item.getAttribute("data-cat");
    if (isWallCategory(cat) && !isDocWallUnlocked(cat)) {
      if (cat === "旅游攻略") { showTourGate(); return; }   // 旅游攻略走全屏密码门
      renderCatWall(cat, item);
      return;
    }
    switchCategory(cat, item);
  });

  // 返回列表
  document.getElementById("backBtn").addEventListener("click", showList);
});

// 统一执行分类切换
function switchCategory(cat, item) {
  document.querySelectorAll("#mainNav a").forEach(function (a) {
    a.classList.remove("active");
  });
  if (item) item.classList.add("active");
  activeCategory = cat;
  activeTag = null;
  renderTagCloud();
  renderCards();
  showList();
  if (cat === "旅游攻略" && !activeTag) openTourStage();
  else closeTourStage();
}

// 分类密码墙：点击受保护导航时整页出现密码框，解锁后进入该分类
function renderCatWall(cat, item) {
  document.querySelectorAll("#mainNav a").forEach(function (a) {
    a.classList.remove("active");
  });
  var list = document.getElementById("docList");
  list.innerHTML =
    '<div class="doc-wall">' +
    '<div class="wall-lock">\uD83D\uDD12</div>' +
    "<h2>「" + escapeHtml(cat) + "」栏目受密码保护</h2>" +
    "<p>输入访问密码后进入，本次访问期间可自由浏览该栏目全部文档。</p>" +
    "<p>该密码仅对本栏目有效，其他受限栏目仍需各自密码。</p>" +
    "<p>密码请向站长获取（微信：Y18725560542）。</p>" +
    '<input type="password" id="catWallPwd" placeholder="请输入访问密码" autocomplete="off">' +
    '<button id="catWallBtn" type="button">解锁进入</button>' +
    '<p id="catWallErr" class="wall-err"></p>' +
    "</div>";
  showList();
  var input = document.getElementById("catWallPwd");
  var err = document.getElementById("catWallErr");
  function tryCatUnlock() {
    var pwd = input.value.trim();
    pwd = pwd.replace(/[\uFF01-\uFF5E]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
    });
    if (!pwd) {
      err.textContent = "请输入密码";
      return;
    }
    if (sha256(pwd) === WALL_HASHES[cat]) {
      setDocWallUnlocked(cat);
      switchCategory(cat, item);
    } else {
      err.textContent = "密码错误，请重试";
      input.value = "";
      input.focus();
    }
  }
  document.getElementById("catWallBtn").addEventListener("click", tryCatUnlock);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") tryCatUnlock();
  });
  input.focus();
}

function showList() {
  document.getElementById("reader").classList.remove("active");
  var tdet = document.getElementById("tourDetail");
  if (tdet) tdet.style.display = "none";
  var st = document.getElementById("tourStage");
  if (st && !st.hidden) {
    // 全屏内：返回 = 回到卡片墙
    var ws = document.getElementById("tourWallStage");
    if (ws) ws.style.display = "";
    return;
  }
  document.getElementById("docList").style.display = "";
  window.scrollTo(0, 0);
}

// ===================== 旅游攻略：可拖动卡片墙 + 三卡 =====================
// 科技感手法（切角 / HUD / 等宽字 / 数据化）仅用于本分类

// 行程地图投影：与 assets/cn-map.js 的 proj 参数配套（Albers 等积圆锥）
var _projFn = null;
function tourProj(lon, lat) {
  var M = window.CN_MAP;
  if (!M) return [0, 0];
  if (!_projFn) {
    var P = M.proj, r = Math.PI / 180;
    var n = (Math.sin(r * P.lat1) + Math.sin(r * P.lat2)) / 2;
    var C = Math.cos(r * P.lat1) * Math.cos(r * P.lat1) + 2 * n * Math.sin(r * P.lat1);
    var rho0 = Math.sqrt(C - 2 * n * Math.sin(r * P.lat0)) / n;
    _projFn = function (lo, la) {
      var rho = Math.sqrt(Math.max(0, C - 2 * n * Math.sin(r * la))) / n;
      var th = n * r * (lo - P.lon0);
      var x = rho * Math.sin(th), y = rho0 - rho * Math.cos(th);
      return [(x - P.minx) * P.k + P.pad, (P.maxy - y) * P.k + P.pad];
    };
  }
  return _projFn(lon, lat);
}

// 地图数据 169KB —— 懒加载，只在需要画行程图时才引入，不进首页
var _mapWait = null;
function ensureMapData(cb) {
  if (window.CN_MAP) { cb(); return; }
  if (_mapWait) { _mapWait.push(cb); return; }
  _mapWait = [cb];
  var s = document.createElement("script");
  s.src = "assets/cn-map.js";
  s.onload = function () {
    var q = _mapWait; _mapWait = null;
    (q || []).forEach(function (f) { f(); });
  };
  s.onerror = function () { _mapWait = null; };
  document.head.appendChild(s);
}

// ---------------- 旅游攻略 · 全屏入口 ----------------
function showTourGate() {
  var g = document.getElementById("tourGate");
  if (!g) return;
  var en = document.getElementById("tgEntries");
  if (en) {
    var n = (window.DOCS || []).filter(function (d) { return d.category === "旅游攻略"; }).length;
    en.textContent = String(n).padStart(3, "0");
  }
  var err = document.getElementById("tourGateErr");
  if (err) err.textContent = "";
  var inp = document.getElementById("tourGatePwd");
  if (inp) inp.value = "";
  g.hidden = false;
  document.body.style.overflow = "hidden";
  setTimeout(function () { if (inp) inp.focus(); }, 60);
}

function tryTourUnlock() {
  var inp = document.getElementById("tourGatePwd");
  var err = document.getElementById("tourGateErr");
  var pwd = inp ? inp.value.trim() : "";
  pwd = pwd.replace(/[\uFF01-\uFF5E]/g, function (ch) {
    return String.fromCharCode(ch.charCodeAt(0) - 0xFEE0);
  });
  if (!pwd) { if (err) err.textContent = "请输入密码"; return; }
  if (sha256(pwd) === WALL_HASHES["旅游攻略"]) {
    setDocWallUnlocked("旅游攻略");
    document.getElementById("tourGate").hidden = true;
    document.body.style.overflow = "";
    switchCategory("旅游攻略", document.querySelector('#mainNav a[data-cat="旅游攻略"]'));
  } else {
    if (err) err.textContent = "密码错误，请重试";
    if (inp) { inp.value = ""; inp.focus(); }
  }
}

function openTourStage() {
  var st = document.getElementById("tourStage");
  if (!st) return;
  st.hidden = false;
  document.body.style.overflow = "hidden";
  var td = document.getElementById("tourDetail");
  if (td) td.style.display = "none";
  var ws = document.getElementById("tourWallStage");
  if (ws) ws.style.display = "";
  var dl = document.getElementById("docList");
  if (dl) dl.style.display = "none";
  renderTourWall(filteredDocs());
}

function closeTourStage() {
  var st = document.getElementById("tourStage");
  if (st) st.hidden = true;
  document.body.style.overflow = "";
}

(function bindTourStage() {
  var ex = document.getElementById("tourExit");
  var gb = document.getElementById("tourGateBtn");
  var gp = document.getElementById("tourGatePwd");
  if (ex) ex.addEventListener("click", function () {
    closeTourStage();
    var home = document.querySelector('#mainNav a[data-cat="主页"]');
    if (home) home.click();
  });
  if (gb) gb.addEventListener("click", tryTourUnlock);
  if (gp) gp.addEventListener("keydown", function (e) { if (e.key === "Enter") tryTourUnlock(); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var g = document.getElementById("tourGate");
    if (g && !g.hidden) { g.hidden = true; document.body.style.overflow = ""; return; }
    var st = document.getElementById("tourStage");
    if (st && !st.hidden) {
      var td = document.getElementById("tourDetail");
      if (td && td.style.display !== "none") showList();
      else if (ex) ex.click();
    }
  });
})();

// ---------------- 可拖动卡片墙 ----------------
// 交互参考 motion/react 的 DraggableCard，用原生 JS 实现（站点保持零依赖）：
//   自由拖动 + 鼠标经过时 3D 倾斜 + 光斑 + 松手惯性甩出（越界自然落回）+ 悬停微放大
var tourDocs = [], tourCards = [], tourZTop = 100;

function twClamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

// 卡片可活动的范围：上下各让出 HUD 的位置
function twBounds(el, home) {
  var w = el.offsetWidth, h = el.offsetHeight;
  var W = home.clientWidth, H = home.clientHeight;
  var pad = 12;
  return {
    x0: pad, x1: Math.max(pad, W - w - pad),
    y0: 70, y1: Math.max(70, H - h - 58)
  };
}

function twApply(el) {
  el.style.setProperty("--x", el.dataset.x + "px");
  el.style.setProperty("--y", el.dataset.y + "px");
  el.style.setProperty("--r", el.dataset.r + "deg");
}

function renderTourWall(docs) {
  var home = document.getElementById("tourWallStage");
  if (!home) return;
  home.innerHTML = "";
  tourCards = [];
  tourDocs = docs || [];
  var n = tourDocs.length;

  // HUD 统计（数据化装饰，同时让规模一眼可见）
  var st = document.getElementById("trStats");
  if (st) {
    var regs = {}, km = 0;
    tourDocs.forEach(function (d) {
      if (d.region) regs[d.region] = 1;
      (d.plan || []).forEach(function (r) { var v = +r[3]; if (isFinite(v)) km += v; });
    });
    st.innerHTML =
      "<span>ENTRIES <b>" + String(n).padStart(3, "0") + "</b></span>" +
      "<span>REGIONS <b>" + String(Object.keys(regs).length).padStart(2, "0") + "</b></span>" +
      "<span>DIST <b>" + km.toLocaleString() + "</b> KM</span>";
  }

  if (!n) {
    stage.innerHTML = '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
                      'color:var(--faint);font-size:13px">这个分类下还没有攻略</div>';
    return;
  }

  var W = home.clientWidth, H = home.clientHeight;
  if (!W || !H) return;      // 容器还没显示（尺寸为 0）时不要布局，否则卡片会挤到角落
  // 卡片宽度随数量自适应：篇数少时卡片大、篇数多时自然靠拢（像散在桌上的一叠照片）
  var cw = Math.min(272, Math.max(132, Math.round((W - 80) / Math.max(n, 3) - 26)));
  var ch = Math.round(cw * 264 / 190);
  var gap = Math.min((W - n * cw) / (n + 1), 42);   // 间隙设上限：篇数少时别散得太开
  var totalW = n * cw + (n - 1) * gap;
  var xStart = Math.max(14, (W - totalW) / 2);

  tourDocs.forEach(function (d, i) {
    var el = document.createElement("div");
    el.className = "tcard";
    el.style.width = cw + "px";
    el.style.height = ch + "px";
    el.style.zIndex = String(10 + i);
    el.dataset.x = Math.round(xStart + i * (cw + gap));
    el.dataset.y = Math.round((H - ch) / 2 + ((i % 2) ? -28 : 24));
    el.dataset.r = ((i % 2 ? 1 : -1) * (2.6 + (i % 3) * 1.3)).toFixed(2);
    twApply(el);
    el.innerHTML =
      '<div class="fc">' +
        '<img src="' + getDocCover(d) + '" alt="">' +
        '<span class="sc"></span>' +
        '<span class="glare"></span>' +
        '<span class="no">' + String(i + 1).padStart(2, "0") + '</span>' +
        '<span class="rg">' + escapeHtml(d.region || "") + '</span>' +
        '<span class="nm">' + escapeHtml(d.title) + '</span>' +
      '</div>';
    home.appendChild(el);
    tourCards.push(el);
    bindTourDrag(el, d, home);
  });
}

// 单卡交互：拖动 / 倾斜 / 惯性
function bindTourDrag(el, doc, home) {
  var drag = false, sx = 0, sy = 0, ox = 0, oy = 0, moved = 0, hr = null, hist = [];

  el.addEventListener("pointerenter", function () { hr = home.getBoundingClientRect(); });

  el.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    drag = true; moved = 0;
    sx = e.clientX; sy = e.clientY;
    ox = +el.dataset.x; oy = +el.dataset.y;
    hist = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    el.classList.add("drag");
    el.style.zIndex = String(++tourZTop);   // 最近碰过的卡片保持在最上层
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
    e.preventDefault();
  });

  el.addEventListener("pointermove", function (e) {
    // 倾斜基准用"未变换时的卡片中心"（缓存容器 rect）——
    // 若读 getBoundingClientRect()，倾斜本身会改变 rect，形成越倾越大的反馈
    if (!hr) hr = home.getBoundingClientRect();
    var cx = hr.left + (+el.dataset.x) + el.offsetWidth / 2;
    var cy = hr.top + (+el.dataset.y) + el.offsetHeight / 2;
    var dx = e.clientX - cx, dy = e.clientY - cy;
    el.style.setProperty("--ry", twClamp(dx / 13.5, -22, 22).toFixed(2) + "deg");
    el.style.setProperty("--rx", twClamp(-dy / 13.5, -22, 22).toFixed(2) + "deg");
    el.style.setProperty("--glare", Math.min(0.22, Math.abs(dx) / 1400).toFixed(3));
    el.style.setProperty("--sc", "1.02");

    if (!drag) return;
    var b = twBounds(el, home);
    el.dataset.x = Math.round(twClamp(ox + (e.clientX - sx), b.x0, b.x1));
    el.dataset.y = Math.round(twClamp(oy + (e.clientY - sy), b.y0, b.y1));
    twApply(el);
    moved = Math.max(moved, Math.sqrt(
      (e.clientX - sx) * (e.clientX - sx) + (e.clientY - sy) * (e.clientY - sy)));
    hist.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (hist.length > 6) hist.shift();
  });

  function twEnd() {
    if (!drag) return;
    drag = false;
    el.classList.remove("drag");
    // 惯性：按最后一段的速度再滑约 0.26s，越界由边界钳住（松手后有点"甩"的手感）
    var a = hist[0], z = hist[hist.length - 1], dt = z ? z.t - a.t : 0;
    var vx = dt > 0 ? (z.x - a.x) / dt : 0, vy = dt > 0 ? (z.y - a.y) / dt : 0;
    var b = twBounds(el, home);
    el.dataset.x = Math.round(twClamp(+el.dataset.x + vx * 260, b.x0, b.x1));
    el.dataset.y = Math.round(twClamp(+el.dataset.y + vy * 260, b.y0, b.y1));
    twApply(el);
    hist = [];
  }
  el.addEventListener("pointerup", twEnd);
  el.addEventListener("pointercancel", twEnd);

  el.addEventListener("pointerleave", function () {
    if (drag) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--glare", "0");
    el.style.setProperty("--sc", "1");
  });

  el.addEventListener("click", function () {
    if (moved > 6) return;        // 拖动过就不算点击
    openTour(doc);
  });
}

// 窗口尺寸变化后重排（防抖）
var _twRt = null;
window.addEventListener("resize", function () {
  if (_twRt) clearTimeout(_twRt);
  _twRt = setTimeout(function () {
    var ws = document.getElementById("tourWallStage");
    var st = document.getElementById("tourStage");
    if (ws && st && !st.hidden && ws.style.display !== "none" && tourDocs.length) {
      renderTourWall(tourDocs);
    }
  }, 320);
});

// ---------------- 三卡详情 ----------------
function openTour(d) {
  document.getElementById("tourWallStage").style.display = "none";
  var td = document.getElementById("tourDetail");
  td.style.display = "";
  td.dataset.idx = String(tourDocs.indexOf(d));
  document.getElementById("tdTitle").textContent = d.title;
  document.getElementById("tdMeta").textContent = (d.date || "") + "  ·  " + (d.region || "");
  document.getElementById("tdRegion").textContent = "REGION " + (d.region || "—");
  document.getElementById("tdP1").innerHTML =
    '<div class="tbox">' + (d.content || "<p>暂无内容</p>") + "</div>";
  renderTourReport(d);
  showTourPane("1");
  td.scrollTop = 0;
}

function showTourPane(p) {
  ["1", "2", "3"].forEach(function (k) {
    var el = document.getElementById("tdP" + k);
    if (el) el.style.display = (k === p) ? "" : "none";
  });
  document.querySelectorAll("#tourDetail .ts3").forEach(function (b) {
    b.classList.toggle("on", b.getAttribute("data-p") === p);
  });
  var idx = +(document.getElementById("tourDetail").dataset.idx || 0);
  var d = tourDocs[idx];
  if (!d) return;
  if (p === "2") ensureMapData(function () { drawTourRoute(d); });
  if (p === "3") animateTourBars();
}

function renderTourReport(d) {
  var cost = d.cost || {};
  var keys = Object.keys(cost);
  var total = keys.reduce(function (a, k) { return a + cost[k]; }, 0);
  var people = 2;
  var days = 0;
  (d.plan || []).forEach(function (r) { days++; });
  var km = 0;
  (d.plan || []).forEach(function (r) {
    var v = parseInt(String(r[3]).replace(/[^0-9]/g, ""), 10);
    if (!isNaN(v)) km += v;
  });
  var paid = total ? Math.round(total / people) : 0;

  var bars = keys.map(function (k) {
    var v = cost[k], pc = total ? Math.round(v / total * 100) : 0;
    return '<div class="tbar"><i>' + escapeHtml(k) + '</i><span class="t"><div data-w="' +
           pc + '"></div></span><u>&#165;' + v + ' / ' + pc + '%</u></div>';
  }).join("");

  var plan = (d.plan || []).map(function (r) {
    return "<tr><td class=\"m\">" + escapeHtml(r[0]) + "</td><td>" + escapeHtml(r[1]) +
           "</td><td>" + escapeHtml(r[2]) + "</td><td class=\"m\">" + escapeHtml(r[3]) + "</td></tr>";
  }).join("");

  document.getElementById("tdP3").innerHTML =
    '<div class="tgr">' +
      '<div class="tmetric"><span>TOTAL COST</span><b>&#165;' + total.toLocaleString() + '</b></div>' +
      '<div class="tmetric"><span>PER PERSON</span><b>&#165;' + paid.toLocaleString() + '</b></div>' +
      '<div class="tmetric"><span>DAYS</span><b>' + days + '<em>D</em></b></div>' +
      '<div class="tmetric"><span>DISTANCE</span><b>' + km.toLocaleString() + '<em>KM</em></b></div>' +
    "</div>" +
    '<div class="tbox"><h4>COST BREAKDOWN</h4>' + bars + "</div>" +
    '<div class="tbox"><h4>PLAN</h4><table><tr><th>DAY</th><th>ROUTE</th><th>STAY</th><th>KM</th></tr>' +
      plan + "</table></div>";
}

function animateTourBars() {
  var bs = document.querySelectorAll("#tdP3 .tbar .t div");
  bs.forEach(function (b) { b.style.width = "0"; });
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      bs.forEach(function (b) { b.style.width = b.getAttribute("data-w") + "%"; });
    });
  });
}

// 从 path 字符串算包围盒（数据是绝对坐标，数字成对出现：x y）
var _bbCache = {};
function pathBBox(dd) {
  if (_bbCache[dd]) return _bbCache[dd];
  var ns = dd.match(/-?\d+(?:\.\d+)?/g);
  var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  if (ns) {
    for (var i = 0; i + 1 < ns.length; i += 2) {
      var x = +ns[i], y = +ns[i + 1];
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  var r = { x0: x0, y0: y0, x1: x1, y1: y1 };
  _bbCache[dd] = r;
  return r;
}

function drawTourRoute(d) {
  var svg = document.getElementById("routeMap");
  if (!svg || !window.CN_MAP || !d.pts || !d.pts.length) return;
  var M = window.CN_MAP;

  var pts = d.pts.map(function (p) {
    var xy = tourProj(p.lon, p.lat);
    return { x: xy[0], y: xy[1], p: p };
  });

  // ---- 视野：以"行程涉及的省份"完整范围为准 ----
  // 只按行程点范围缩放会把地图缩成一小团、标签糊在一起；按省份范围则主体饱满、还能看到邻省
  var xs = pts.map(function (a) { return a.x; }), ys = pts.map(function (a) { return a.y; });
  var on = {};
  pts.forEach(function (a) { if (a.p.pv) on[a.p.pv] = 1; });

  var bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity, hasProv = false;
  Object.keys(on).forEach(function (a) {
    (M.provinces[a] || []).forEach(function (dd) {
      var b = pathBBox(dd);
      if (!isFinite(b.x0)) return;
      hasProv = true;
      if (b.x0 < bx0) bx0 = b.x0;
      if (b.y0 < by0) by0 = b.y0;
      if (b.x1 > bx1) bx1 = b.x1;
      if (b.y1 > by1) by1 = b.y1;
    });
  });
  // 与行程点范围取并集（防止点落在省界之外）
  bx0 = Math.min(bx0, Math.min.apply(null, xs)); bx1 = Math.max(bx1, Math.max.apply(null, xs));
  by0 = Math.min(by0, Math.min.apply(null, ys)); by1 = Math.max(by1, Math.max.apply(null, ys));
  if (!hasProv) {                      // 没有省份信息时退回"点范围 + 固定边距"
    bx0 = Math.min.apply(null, xs) - 260; bx1 = Math.max.apply(null, xs) + 260;
    by0 = Math.min.apply(null, ys) - 260; by1 = Math.max.apply(null, ys) + 260;
  }
  var mw = (bx1 - bx0) * 0.10, mh = (by1 - by0) * 0.10;   // 留 10% 余量
  bx0 -= mw; bx1 += mw; by0 -= mh; by1 += mh;

  var x0 = bx0, y0 = by0, vw = bx1 - bx0, vh = by1 - by0, ratio = 1000 / 620;
  if (vw / vh < ratio) { var nw = vh * ratio; x0 -= (nw - vw) / 2; vw = nw; }
  else { var nh = vw / ratio; y0 -= (nh - vh) / 2; vh = nh; }
  svg.setAttribute("viewBox", x0.toFixed(0) + " " + y0.toFixed(0) + " " +
                              vw.toFixed(0) + " " + vh.toFixed(0));

  // ---- 高亮行程省份，其余淡显 ----
  var base = "", hi = "";
  Object.keys(M.provinces).forEach(function (a) {
    if (a === "100000_JD") return;
    if (on[a]) {
      M.provinces[a].forEach(function (dd) { hi += '<path class="prov on" d="' + dd + '"/>'; });
    } else {
      M.provinces[a].forEach(function (dd) { base += '<path class="prov" d="' + dd + '"/>'; });
    }
  });
  // 九段线：数据保持完整（淡显，不喧宾夺主）
  (M.provinces["100000_JD"] || []).forEach(function (dd) {
    base += '<path class="prov" d="' + dd + '"/>';
  });

  var dpath = "M" + pts.map(function (a) {
    return a.x.toFixed(1) + " " + a.y.toFixed(1);
  }).join(" L");

  var marks = "", labels = "", seen = {}, li = 0, placed = [];
  pts.forEach(function (a, i) {
    if (a.p.stay)
      marks += '<circle class="stop stay" cx="' + a.x.toFixed(1) + '" cy="' + a.y.toFixed(1) + '" r="5.5"/>';
    else
      marks += '<circle class="stop" cx="' + a.x.toFixed(1) + '" cy="' + a.y.toFixed(1) + '" r="3.2"/>';

    // 起点：菱形
    if (i === 0)
      marks += '<rect class="start" x="' + (a.x - 5).toFixed(1) + '" y="' + (a.y - 5).toFixed(1) +
               '" width="10" height="10" transform="rotate(45 ' + a.x.toFixed(1) + ' ' +
               a.y.toFixed(1) + ')"/>';
    // 终点：双环
    if (i === pts.length - 1 && pts.length > 1)
      marks += '<circle class="endl" cx="' + a.x.toFixed(1) + '" cy="' + a.y.toFixed(1) + '" r="11"/>' +
               '<circle class="endl2" cx="' + a.x.toFixed(1) + '" cy="' + a.y.toFixed(1) + '" r="3.4"/>';

    if (!seen[a.p.n]) {
      seen[a.p.n] = 1;
      var txt = "D" + a.p.d + " \u00b7 " + a.p.n;
      var fs = vw / 54;                                  // 字号随视野缩放，显示尺寸恒定
      var w = fs * 1.1;
      for (var k = 0; k < txt.length; k++) w += /[\u4e00-\u9fa5]/.test(txt.charAt(k)) ? fs * 1.02 : fs * 0.62;
      var box = fs * 1.8, gap = fs * 0.85;
      // 8 向候选位置 + 碰撞避让：挑第一个不与已放标签重叠、且不越出画面的位置
      var dxs = [gap, -w - gap], dys = [-fs * 0.5, fs * 1.45, fs * 3.1, -fs * 2.3];
      var lx = null, ly = null;
      for (var ci = 0; ci < 8; ci++) {
        var cx = a.x + dxs[ci % 2], cy = a.y + dys[(ci >> 1)];
        if (cx < x0 + fs || cx + w > x0 + vw - fs) continue;
        var r = { x0: cx, y0: cy - box / 2, x1: cx + w, y1: cy + box / 2 }, hit = false;
        for (var q = 0; q < placed.length; q++) {
          var p = placed[q];
          if (!(r.x1 < p.x0 || r.x0 > p.x1 || r.y1 < p.y0 || r.y0 > p.y1)) { hit = true; break; }
        }
        if (!hit) { placed.push(r); lx = cx; ly = cy; break; }
      }
      if (lx === null) {                                 // 全都挤 -> 退回默认位
        lx = Math.max(x0 + fs, Math.min(a.x + gap, x0 + vw - w - fs));
        ly = a.y + (li % 2 ? fs * 1.5 : -fs * 0.55);
      }
      li++;
      labels += '<line class="lln" x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) +
                '" x2="' + (lx > a.x ? lx : lx + w).toFixed(1) + '" y2="' + ly.toFixed(1) + '"/>' +
                '<rect class="lblbg" x="' + lx.toFixed(1) + '" y="' + (ly - box / 2).toFixed(1) +
                '" width="' + w.toFixed(1) + '" height="' + box.toFixed(1) +
                '" rx="' + (fs * 0.16).toFixed(1) + '"/>' +
                '<text class="lbl" style="font-size:' + fs.toFixed(2) + 'px" x="' +
                (lx + fs * 0.62).toFixed(1) + '" y="' + (ly + fs * 0.34).toFixed(1) +
                '">' + "D" + a.p.d + " &#183; " + escapeHtml(a.p.n) + "</text>";
    }
  });

  svg.innerHTML = base + hi +
    '<path class="glow" id="routeGlow" d="' + dpath + '"/>' +
    '<path class="rte" id="routePath" d="' + dpath + '"/>' +
    '<path class="dash" id="routeDash" d="' + dpath + '"/>' +
    marks + labels;

  // 右上角读数
  var rd = document.getElementById("mapRead");
  if (rd) {
    var km = 0;
    (d.plan || []).forEach(function (r) {
      var v = +r[3];
      if (isFinite(v)) km += v;
    });
    rd.textContent = "STOPS " + pts.length + (km ? " / " + km.toLocaleString() + " KM" : "");
  }

  // 路线逐段生长（主线 + 发光底一起长，流动虚线最后淡入）
  var el = document.getElementById("routePath"), gl = document.getElementById("routeGlow");
  var len = el.getTotalLength();
  [el, gl].forEach(function (x) {
    x.style.strokeDasharray = len;
    x.style.strokeDashoffset = len;
    x.style.transition = "none";
  });
  var dash = document.getElementById("routeDash");
  if (dash) { dash.style.opacity = "0"; dash.style.transition = "none"; }
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      [el, gl].forEach(function (x) {
        x.style.transition = "stroke-dashoffset 2.2s cubic-bezier(.3,.7,.3,1)";
        x.style.strokeDashoffset = 0;
      });
      if (dash) { dash.style.transition = "opacity .55s ease 1.5s"; dash.style.opacity = "1"; }
    });
  });
}

// 三卡按钮绑定（DOM 已就绪：app.js 在 body 末尾加载）
(function bindTourUI() {
  var back = document.getElementById("tourBack");
  if (back) back.addEventListener("click", showList);
  document.querySelectorAll("#tourDetail .ts3").forEach(function (b) {
    b.addEventListener("click", function () { showTourPane(b.getAttribute("data-p")); });
  });
})();

// ===== 渲染入口 =====
function renderAll() {
  renderTagCloud();
  renderCards();
}

// ===== 标签照片 =====
// 有专属照片的标签用 TAG_IMAGES 里的配置，其余统一用默认照片
function getTagImage(tag) {
  var conf = window.TAG_IMAGES || {};
  return conf[tag] || "assets/tag-default.jpg";
}

// ===== 文档卡片封面 =====
// 取图优先级：文档自带 cover > 第一个标签的照片 > 分类的照片 > 默认照片
function getDocCover(d) {
  if (d.cover) return d.cover;
  var conf = window.TAG_IMAGES || {};
  var tags = cleanTags(d.tags);
  if (tags.length && conf[tags[0]]) return conf[tags[0]];
  if (d.category && conf[d.category]) return conf[d.category];
  return "assets/tag-default.jpg";
}

// ===== 标签云 =====
// 过滤非法标签（None/null/空串），防止脏数据显示为标签
function cleanTags(tags) {
  return (tags || []).filter(function (t) {
    if (t == null) return false;
    var s = String(t).trim();
    if (!s) return false;
    var low = s.toLowerCase();
    if (low === "none" || low === "null" || low === "nan" || low === "undefined") return false;
    return true;
  });
}
function getAllTags() {
  var map = {};
  allDocs().forEach(function (d) {
    // 只统计当前分类下的标签；activeCategory="all"（点标签跨分类浏览）时显示全部
    if (activeCategory !== "all" && d.category !== activeCategory) return;
    cleanTags(d.tags).forEach(function (t) {
      map[t] = (map[t] || 0) + 1;
    });
  });
  return Object.keys(map).sort(function (a, b) { return map[b] - map[a]; });
}

function renderTagCloud() {
  var cloud = document.getElementById("tagCloud");
  cloud.innerHTML = "";
  getAllTags().forEach(function (t) {
    var el = document.createElement("span");
    el.className = "tc" + (activeTag === t ? " on" : "");
    // hover 照片浮窗：专属照片或默认照片
    var pop = document.createElement("img");
    pop.className = "tc-pop";
    pop.src = getTagImage(t);
    pop.alt = "";
    el.appendChild(pop);
    el.appendChild(document.createTextNode(t));
    el.addEventListener("click", function () {
      activeTag = (activeTag === t) ? null : t;
      // 点击标签 = 跨分类查看所有涉及该标签的文档（activeCategory="all"，导航不高亮任何分类）
      activeCategory = "all";
      document.querySelectorAll("#mainNav a").forEach(function (a) {
        a.classList.remove("active");
      });
      renderTagCloud();
      renderCards();
      showList();
    });
    cloud.appendChild(el);
  });
}

// ===== 文档数据（纯静态，来自 docs.js）=====
// 受限栏目未解锁时，其文档对访客「完全不可见」：
// 列表、搜索、标签云、跨分类标签视图一律不出现
// （堵住「绕过密码墙看到受限栏目标题/摘要」的豁口）
function isDocVisible(d) {
  return !isWallCategory(d.category) || isDocWallUnlocked(d.category);
}

function allDocs() {
  return (window.DOCS || []).filter(isDocVisible);
}

function filteredDocs() {
  return allDocs().filter(function (d) {
    if (activeCategory !== "all") {
      if (d.category !== activeCategory) return false;
    }
    if (activeTag) {
      var tags = cleanTags(d.tags);
      if (tags.indexOf(activeTag) === -1) return false;
    }
    if (searchKeyword) {
      var hay = (d.title + " " + d.category + " " + d.summary + " " + cleanTags(d.tags).join(" ")).toLowerCase();
      if (hay.indexOf(searchKeyword) === -1) return false;
    }
    return true;
  });
}

function renderCards() {
  var list = document.getElementById("docList");
  var docs = filteredDocs();

  // 旅游攻略：走「可拖动卡片墙」（点卡片 → 三卡详情），不用通栏卡片列表
  var isTour = (activeCategory === "旅游攻略" && !activeTag);
  var tdet = document.getElementById("tourDetail");
  if (tdet) tdet.style.display = "none";
  if (isTour) {
    list.style.display = "none";
    return;                       // 卡片墙由全屏舞台负责（openTourStage）
  }
  list.style.display = "";

  list.innerHTML = "";

  // 选中标签时，列表顶部显示该标签的照片横幅
  if (activeTag) {
    var banner = document.createElement("div");
    banner.className = "tag-banner";
    banner.innerHTML =
      '<img src="' + getTagImage(activeTag) + '" alt="">' +
      "<div><h2>标签：" + escapeHtml(activeTag) + "</h2>" +
      "<p>共 " + docs.length + " 篇文档</p></div>";
    list.appendChild(banner);
  }

  if (docs.length === 0) {
    var empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "没有匹配的文档";
    list.appendChild(empty);
    return;
  }

  docs.forEach(function (d) {
    var card = document.createElement("div");
    card.className = "doc-card";

    var coverHtml = '<div class="card-cover"><img src="' + getDocCover(d) + '" alt=""></div>';
    var tagsHtml = '<div class="tag-row">' +
      (cleanTags(d.tags)).map(function (t) { return '<span class="tag">' + escapeHtml(t) + "</span>"; }).join("") +
      "</div>";
    var metaHtml = '<div class="meta">' +
      '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>' +
      escapeHtml(d.date || "") + "</div>";

    card.innerHTML =
      coverHtml +
      '<div class="card-body">' +
      tagsHtml +
      "<h3>" + escapeHtml(d.title) + "</h3>" +
      '<div class="summary">' + escapeHtml(d.summary) + "</div>" +
      metaHtml +
      "</div>";

    card.addEventListener("click", function () { openDoc(d); });
    list.appendChild(card);
  });
}

// ===== 阅读页 =====
function openDoc(d) {
  document.getElementById("docList").style.display = "none";
  var reader = document.getElementById("reader");
  reader.classList.add("active");
  document.getElementById("readerTitle").textContent = d.title;

  var meta = document.getElementById("readerMeta");
  meta.innerHTML = "";
  if (d.date) {
    var s1 = document.createElement("span");
    s1.textContent = d.date;
    meta.appendChild(s1);
  }
  cleanTags(d.tags).forEach(function (t) {
    var s = document.createElement("span");
    s.className = "tag";
    s.textContent = t;
    meta.appendChild(s);
  });

  renderDocBody(d);
  window.scrollTo(0, 0);
}

function renderDocBody(d) {
  document.getElementById("readerBody").innerHTML =
    '<div class="reader-cover"><img src="' + getDocCover(d) + '" alt=""></div>' +
    (d.content || "<p>暂无内容</p>");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


