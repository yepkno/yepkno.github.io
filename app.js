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
// ===== 右下角悬浮播放器（自绘 UI + APlayer 引擎 + 可拖动）=====
function initPlayer() {
  if (typeof APlayer === "undefined") return;
  var list = (window.MUSIC && window.MUSIC.list) || [];
  var fix = document.getElementById("playerFix");
  if (!list.length || !fix) return;

  // 音频地址以编码形式存于歌单（站点/仓库中不出现音频源域名），播放前在此解码
  function decodeSrc(it) {
    return { name: it.name, artist: it.artist, cover: it.cover,
             url: atob(it.src).split("").reverse().join("") };
  }

  var ap = new APlayer({
    container: fix.querySelector("#aplayer"),
    fixed: false,
    mini: false,
    autoplay: false,
    loop: "one",
    order: "list",
    volume: 0.5,
    theme: "#ff461f",
    audio: list.map(decodeSrc)
  });

  // 播放器区域：仅在线收听设计——禁右键/拖拽，避免被当成交互入口获取音频地址
  fix.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  fix.addEventListener("dragstart", function (e) { e.preventDefault(); });

  var idx = 0;              // 当前曲目下标
  var loopMode = 0;         // 0=list 1=all 2=one
  var $ = function (s) { return fix.querySelector(s); };

  // ---- 歌单渲染 ----
  function renderList() {
    var box = $(".plist");
    box.innerHTML = "";
    list.forEach(function (s, i) {
      var it = document.createElement("div");
      it.className = "pl-item" + (i === idx ? " cur" : "");
      it.innerHTML = '<span class="pl-idx">' + (i + 1) + '</span><span>' + s.name + '</span>';
      it.addEventListener("click", function () { idx = i; ap.list.switch(i); ap.play(); renderList(); });
      box.appendChild(it);
    });
  }

  // ---- 时间格式化 ----
  function fmt(s) {
    if (!s || isNaN(s)) return "00:00";
    s = Math.floor(s);
    var m = Math.floor(s / 60), r = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r;
  }

  // ---- 更新元信息 + 进度 ----
  function updateMeta() {
    var cur = list[idx] || {};
    $(".ptitle").textContent = cur.name || "—";
    $(".partist").textContent = cur.artist || "—";
    $(".pdisc img").src = cur.cover || "assets/music-cover.jpg";
    $(".pdisc-big img").src = cur.cover || "assets/music-cover.jpg";
  }
  function updateBar() {
    var t = ap.audio ? ap.audio.currentTime : 0;
    var d = ap.audio ? (ap.audio.duration || 0) : 0;
    $("#pCur").textContent = fmt(t);
    $("#pDur").textContent = fmt(d);
    var pct = d ? (t / d * 100) : 0;
    $("#pBarFill").style.width = pct + "%";
  }

  // ---- 播放状态 ----
  function setPlaying(on) {
    fix.classList.toggle("playing", on);
    var pl = $(".pb-play");
    pl.setAttribute("title", on ? "暂停" : "播放");
  }

  // ---- 按钮事件 ----
  $(".pb-play").addEventListener("click", function () { ap.toggle(); });
  $("[data-act=prev]").addEventListener("click", function () {
    idx = (idx - 1 + list.length) % list.length; ap.list.switch(idx); ap.play(); updateMeta(); renderList();
  });
  $("[data-act=next]").addEventListener("click", function () {
    idx = (idx + 1) % list.length; ap.list.switch(idx); ap.play(); updateMeta(); renderList();
  });
  $("[data-act=loop]").addEventListener("click", function () {
    loopMode = (loopMode + 1) % 3;
    ap.list.audios.forEach(function (a) { a.loop = (loopMode === 2); });
    $("#pLoop").classList.toggle("on", loopMode !== 0);
    $("#pLoop").setAttribute("title", ["循环：列表循环", "循环：顺序播放", "循环：单曲循环"][loopMode]);
    var lt = document.getElementById("pLoopT");
    if (lt) lt.textContent = ["列表", "顺序", "单曲"][loopMode];
  });
  $("[data-act=list]").addEventListener("click", function () {
    $(".plist").classList.toggle("show");
  });

  // ---- 进度条点击跳转 ----
  $(".pbar").addEventListener("click", function (e) {
    if (!ap.audio || !ap.audio.duration) return;
    var r = this.getBoundingClientRect();
    var ratio = (e.clientX - r.left) / r.width;
    ap.audio.currentTime = ratio * ap.audio.duration;
    updateBar();
  });

  // ---- APlayer 事件 ----
  ap.on("play", function () { setPlaying(true); });
  ap.on("pause", function () { setPlaying(false); });
  ap.on("ended", function () { setPlaying(false); });
  ap.on("timeupdate", function () { updateBar(); });
  ap.on("loadedmetadata", function () { updateBar(); });
  ap.on("listswitch", function () {
    // 以 APlayer 的当前下标为准（旧写法用歌名反查会失败并重置为 0，导致封面歌名永远不更新）
    if (window.MUSIC && ap.list && typeof ap.list.index === "number") {
      idx = ap.list.index;
    }
    updateMeta(); renderList();
  });

  // ---- 吸附 / 展开 / 收起（含自动缩小）----
  // 把播放器贴到最近的左右两边（12px 边距），垂直保持在屏幕内，并记忆位置
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

  // 自动缩小：鼠标离开面板 5 秒后收起；点击页面其他区域立即收起；双击唱片收起
  var hideTimer = null;
  function startHide() {
    stopHide();
    hideTimer = setTimeout(collapse, 5000);
  }
  function stopHide() {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  }
  fix.addEventListener("mouseenter", stopHide);
  fix.addEventListener("mouseleave", function () {
    if (!fix.classList.contains("collapsed")) startHide();
  });
  document.addEventListener("click", function (e) {
    if (!fix.contains(e.target)) collapse();
  });
  $(".pdisc-big").addEventListener("dblclick", function () { collapse(); });

  // ---- 拖动位置（面板任意处 / 收起圆盘按住拖动；松手自动吸附左右两边；位置记忆）----
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem("playerPos2") || "null"); } catch (e) { saved = null; }
  if (saved && saved.x != null && saved.y != null) {
    fix.style.left = saved.x + "px"; fix.style.top = saved.y + "px";
    fix.style.right = "auto"; fix.style.bottom = "auto";
    snapToEdge(); // 恢复后按当前收起/展开宽度重新贴边，兼容旧坐标
  }
  var dragging = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0, dragFrom = null;
  function startDrag(e, from) {
    // 按钮 / 进度条 / 歌单不触发拖动
    if (e.target.closest && e.target.closest(".pb, .pbar, .plist")) return;
    dragging = true; moved = false; dragFrom = from;
    sx = e.clientX; sy = e.clientY;
    var r = fix.getBoundingClientRect(); ox = r.left; oy = r.top;
    e.preventDefault();
  }
  // 展开面板整体可拖（把手 .pdrag / 大唱片 / 空白处均可），收起圆盘可拖
  $(".ppanel").addEventListener("mousedown", function (e) { startDrag(e, "panel"); });
  $(".pdisc").addEventListener("mousedown", function (e) { startDrag(e, "disc"); });
  // 防止面板里的图片触发浏览器原生图片拖拽
  fix.addEventListener("dragstart", function (e) { e.preventDefault(); });
  window.addEventListener("mousemove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved && Math.abs(dx) + Math.abs(dy) > 6) { moved = true; fix.classList.add("dragging"); }
    if (!moved) return;
    // 关键：按当前状态的实际宽度钳制（收起 56px / 展开 280px），左右两边都能贴满
    var maxX = Math.max(0, window.innerWidth - fix.offsetWidth);
    var nx = Math.max(0, Math.min(ox + dx, maxX));
    var ny = Math.max(0, Math.min(oy + dy, window.innerHeight - fix.offsetHeight));
    fix.style.left = nx + "px"; fix.style.top = ny + "px";
    fix.style.right = "auto"; fix.style.bottom = "auto";
  });
  window.addEventListener("mouseup", function () {
    if (!dragging) return;
    dragging = false;
    fix.classList.remove("dragging");
    if (!moved) {
      // 圆盘单击（没有拖动）= 展开
      if (dragFrom === "disc") expand();
      return;
    }
    snapToEdge();
  });

  // 初始
  updateMeta();
  renderList();
  updateBar();
  setPlaying(false);
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
function allDocs() {
  return window.DOCS || [];
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


