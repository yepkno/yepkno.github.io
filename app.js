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
  document.getElementById("docList").style.display = "";
  window.scrollTo(0, 0);
}

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


