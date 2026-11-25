import "./style.css";

const icons = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  scan: '<path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3M8 12h8m-4-4v8"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 16v4h16v-4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  image:
    '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  link: '<path d="m10 13 4-4m-5 7-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 0 2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3h.01"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
};
const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.grid}</svg>`;
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
const scenes = [
  {
    id: "workspace",
    title: "开放式办公空间",
    image: "/images/workspace.jpg",
    type: "工作空间",
    subtitle: "从陈设、空间与光线中发现记忆线索",
    clues: [
      {
        name: "木质书架",
        category: "物体线索",
        detail:
          "左侧的低矮木质书架，将书籍与休息区连接起来，形成场景的视觉锚点。",
        box: [9.5, 49.5, 31.5, 17],
        color: "green",
      },
      {
        name: "共享茶水区",
        category: "空间线索",
        detail: "画面右侧的冰箱与橱柜，勾勒出办公空间中的共享茶水区。",
        box: [65, 31, 34, 36],
        color: "orange",
      },
      {
        name: "纵深走廊",
        category: "环境线索",
        detail: "中央延伸的走廊与玻璃隔断，构成鲜明的纵深感和空间方向。",
        box: [42, 28, 22, 39],
        color: "blue",
      },
    ],
  },
  {
    id: "cafe",
    title: "街角咖啡馆",
    image: "/images/cafe.jpg",
    type: "生活场景",
    subtitle: "在日常空间中寻找值得记住的细节",
    clues: [
      {
        name: "室内陈设",
        category: "空间线索",
        detail:
          "观察室内陈设和布局，在相似场景中找到关联。示例标注，不代表模型识别结果。",
        box: [15, 22, 65, 55],
        color: "orange",
      },
    ],
  },
  {
    id: "interior",
    title: "温暖的居家角落",
    image: "/images/interior.jpg",
    type: "生活场景",
    subtitle: "让熟悉的空间拥有可检索的记忆",
    clues: [
      {
        name: "居家空间",
        category: "空间线索",
        detail:
          "以空间整体为线索，记录这张图像的场景印象。示例标注，不代表模型识别结果。",
        box: [18, 22, 64, 58],
        color: "green",
      },
    ],
  },
];
let saved = [];
try {
  const raw = JSON.parse(localStorage.getItem("aevmem-saved") || "[]");
  if (Array.isArray(raw))
    saved = raw.filter((id) => scenes.some((s) => s.id === id));
} catch {
  /* Storage may be unavailable in private mode. */
}
let activeScene = scenes[0],
  activeClue = 0,
  view = "overview",
  filter = "全部",
  query = "",
  marking = false;
const app = document.querySelector("#app");
app.innerHTML = `
  <aside class="sidebar">
    <a class="brand" href="#overview" aria-label="AEVMem 首页"><span class="brand-mark">${icon("scan")}</span>AEV<span>Mem</span></a>
    <div class="workspace-switch"><span class="workspace-avatar">A</span><span>个人工作空间<small>Personal workspace</small></span><span class="switch-arrow">⌄</span></div>
    <p class="nav-caption">工作台 <span>WORKSPACE</span></p>
    <nav aria-label="主导航">
      <button class="nav-item active" data-view="overview">${icon("grid")}概览</button>
      <button class="nav-item" data-view="memories">${icon("layers")}记忆库<span class="nav-count">3</span></button>
      <button class="nav-item" data-view="clues">${icon("scan")}视觉线索</button>
    </nav>
    <div class="sidebar-note"><span class="little-spark">✳</span><h3>不止看见，更能记住。</h3><p>把零散的视觉信息，<br>连接成有意义的记忆。</p><button id="guide-button">了解工作原理 ${icon("arrow")}</button></div>
    <div class="sidebar-bottom"><span class="demo-dot"></span>交互演示 · 本地数据<button id="help-button" aria-label="使用帮助">${icon("help")}</button></div>
    <div class="profile"><span class="profile-avatar">A</span><span>探索者<small>个人空间</small></span><span class="profile-badge">DEMO</span></div>
  </aside>
  <div class="main-shell">
    <header class="topbar"><div class="breadcrumb">工作空间 <span>/</span> <strong id="breadcrumb-current">概览</strong></div><div class="topbar-right"><span class="local-status"><i></i> 本地演示模式</span><span class="topbar-divider"></span><span class="avatar-small">A</span></div></header>
    <main id="main-content">
      <section class="page-heading"><div><div class="eyebrow">YOUR VISUAL MEMORY, CONNECTED</div><h1 id="page-title">让每一次看见，都成为记忆<span>。</span></h1><p id="page-description">从图像中发现线索，为智能体构建更有上下文的记忆。</p></div><button class="button primary" id="upload-button">${icon("plus")} 添加图像</button><input id="file-input" type="file" accept="image/jpeg,image/png,image/webp" hidden></section>
      <div class="demo-notice">${icon("scan")}<span>当前为前端交互演示：示例线索为人工预设，上传图像可手动标注，未接入视觉模型。</span><span class="notice-label">DEMO</span></div>
      <section class="stats" aria-label="记忆统计">
        <article class="stat"><span class="stat-icon peach">${icon("image")}</span><div><p>图像记忆</p><strong id="image-count">03</strong><span class="stat-unit">张</span></div><span class="stat-note">从视觉出发</span></article>
        <article class="stat"><span class="stat-icon sage">${icon("scan")}</span><div><p>视觉线索</p><strong id="clue-count">05</strong><span class="stat-unit">条</span></div><span class="stat-note">发现关键细节</span></article>
        <article class="stat"><span class="stat-icon lavender">${icon("layers")}</span><div><p>已收藏记忆</p><strong id="saved-count">00</strong><span class="stat-unit">张</span></div><span class="stat-note">让记忆有迹可循</span></article>
      </section>
      <section class="explorer" id="explorer-section">
        <div class="section-heading"><div><h2>视觉探索 <span class="tag-soft">交互体验</span></h2><p>聚焦图像细节，发现记忆的连接点。</p></div><button class="text-button" id="switch-scene">切换示例 ${icon("arrow")}</button></div>
        <div class="explorer-grid">
          <div class="image-panel"><div class="image-toolbar"><span>${icon("image")} <span id="image-filename">workspace.jpg</span></span><span class="image-toolbar-right">${icon("scan")} <span id="annotation-count">3 个示例标注</span></span></div><div class="image-stage" id="image-stage"><img id="scene-image" src="/images/workspace.jpg" alt="阳光下的工作空间"/><div id="annotations"></div><span class="image-caption">VISUAL MEMORY / <span id="scene-number">001</span></span><button id="expand-image" aria-label="放大图像">${icon("expand")}</button></div><div class="image-footer"><span><i class="pulse-dot"></i><span id="scene-title">阳光下的工作空间</span></span><span class="sample-label" id="sample-label">示例图像</span></div></div>
          <div class="clue-panel"><div class="clue-heading"><h3>${icon("scan")} 图像中的线索 <span id="clue-badge">03</span></h3><p id="clue-instruction">点击线索，在图像中查看对应区域</p></div><div id="clue-list"></div><div id="clue-detail" class="clue-detail"></div><button class="button add-clue-button" id="add-clue" hidden>手动添加线索</button><button class="button save-button" id="save-memory">${icon("plus")} 收藏这段记忆</button></div>
        </div>
      </section>
      <section class="memory-section" id="memory-section"><div class="section-heading"><div><h2 id="memory-heading">记忆片段 <span class="section-count">03</span></h2><p>每一张图像，都是一段可以被唤起的记忆。</p></div><label class="search-field">${icon("search")}<input id="memory-search" placeholder="搜索场景、线索…" aria-label="搜索记忆"/><kbd>/</kbd></label></div><div class="filter-row" role="group" aria-label="记忆筛选"><button class="filter active" data-filter="全部">全部记忆</button><button class="filter" data-filter="工作空间">工作空间</button><button class="filter" data-filter="生活场景">生活场景</button><button class="filter" data-filter="已收藏">已收藏 <span id="saved-filter-count">0</span></button><span class="filter-hint">${icon("clock")} 最近添加</span></div><div class="memory-grid" id="memory-grid"></div></section>
      <footer class="page-footer"><span><span class="footer-mark">✳</span> AEVMem <span>· 让视觉线索连接记忆</span></span><span>探索 · 关联 · 记住</span></footer>
    </main>
  </div>
  <dialog id="help-dialog"><button class="dialog-close" aria-label="关闭帮助">${icon("close")}</button><span class="dialog-kicker">AEVMem / 快速开始</span><h2>让线索成为记忆的起点。</h2><ol><li><strong>探索图像</strong><p>点击图像标注或线索卡片，查看视觉细节与说明。</p></li><li><strong>建立记忆</strong><p>收藏示例场景，在记忆库通过关键词和分类找回它们。</p></li><li><strong>带入你的图像</strong><p>添加不超过 10 MB 的 JPG、PNG 或 WebP 图像，点击图像添加手动线索。图片仅保留在本次会话，不会上传。</p></li></ol><p class="dialog-note">这是无需后端的交互式原型，不执行真实图像识别或语义检索。示例收藏保存在当前浏览器中。</p><button class="button primary dialog-done">开始探索 ${icon("arrow")}</button></dialog>
  <dialog id="image-dialog"><button class="dialog-close" aria-label="关闭大图">${icon("close")}</button><img alt=""/></dialog>
  <dialog id="annotation-dialog"><h2>添加视觉线索</h2><form id="annotation-form"><label>线索名称<input id="annotation-name" maxlength="40" required placeholder="例如：窗边的绿植"/></label><div class="position-fields"><label>水平位置（0–80%）<input id="annotation-x" type="number" min="0" max="80" step="any" required value="40"/></label><label>垂直位置（0–80%）<input id="annotation-y" type="number" min="0" max="80" step="any" required value="40"/></label></div><label>记忆说明<textarea id="annotation-description" maxlength="240" placeholder="是什么让你记住这个细节？"></textarea></label><div class="dialog-actions"><button type="button" class="button" id="cancel-annotation">取消</button><button class="button primary" type="submit">添加线索</button></div></form></dialog>
  <div class="toast" id="toast" role="status"></div>
`;
const $ = (selector) => document.querySelector(selector);
let toastTimer;
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3200);
}
function renderScene() {
  $("#scene-image").src = activeScene.image;
  $("#scene-image").alt = activeScene.title;
  $("#scene-title").textContent = activeScene.title;
  $("#image-filename").textContent = activeScene.sessionOnly
    ? "本地图像 · 仅本次会话"
    : `${activeScene.id}.jpg`;
  $("#annotation-count").textContent =
    `${activeScene.clues.length} 个${activeScene.sessionOnly ? "手动" : "示例"}标注`;
  $("#sample-label").textContent = activeScene.sessionOnly
    ? "点击图像添加线索"
    : "示例图像";
  $("#scene-number").textContent = String(
    scenes.indexOf(activeScene) + 1,
  ).padStart(3, "0");
  $("#clue-badge").textContent = String(activeScene.clues.length).padStart(
    2,
    "0",
  );
  $("#clue-instruction").textContent = activeScene.sessionOnly
    ? "点击图像任意位置，手动添加视觉线索"
    : "点击线索，在图像中查看对应区域";
  $("#image-stage").classList.toggle(
    "marking",
    Boolean(activeScene.sessionOnly),
  );
  $("#add-clue").hidden = !activeScene.sessionOnly;
  $("#annotations").innerHTML = activeScene.clues
    .map(
      (clue, i) =>
        `<button class="annotation ${clue.color} ${i === activeClue ? "selected" : ""}" data-clue="${i}" style="left:${clue.box[0]}%;top:${clue.box[1]}%;width:${clue.box[2]}%;height:${clue.box[3]}%" aria-label="定位：${escape(clue.name)}" aria-pressed="${i === activeClue}"><span>${String(i + 1).padStart(2, "0")} ${escape(clue.name)}</span><i></i></button>`,
    )
    .join("");
  $("#clue-list").innerHTML =
    activeScene.clues
      .map(
        (clue, i) =>
          `<button class="clue-card ${i === activeClue ? "selected" : ""}" data-clue="${i}" aria-pressed="${i === activeClue}"><span class="clue-number ${clue.color}">${String(i + 1).padStart(2, "0")}</span><span><strong>${escape(clue.name)}</strong><small>${escape(clue.category)}</small></span><span class="clue-arrow">↗</span></button>`,
      )
      .join("") ||
    '<p class="empty-clues">还没有线索。<br>点击图像，记录第一个视觉细节。</p>';
  const clue = activeScene.clues[activeClue];
  $("#clue-detail").innerHTML = clue
    ? `<span>${icon("link")} 记忆上下文</span><p>${escape(clue.detail)}</p>`
    : "<span>手动标注模式</span><p>本演示不会自动分析上传图片，也不会将图片发送至服务器。</p>";
  $("#save-memory").innerHTML =
    `${icon(saved.includes(activeScene.id) ? "check" : "plus")} ${saved.includes(activeScene.id) ? "已收藏 · 点击取消" : "收藏这段记忆"}`;
  $("#save-memory").setAttribute(
    "aria-pressed",
    String(saved.includes(activeScene.id)),
  );
  updateStats();
}
function updateStats() {
  $("#image-count").textContent = String(scenes.length).padStart(2, "0");
  $("#clue-count").textContent = String(
    scenes.reduce((sum, scene) => sum + scene.clues.length, 0),
  ).padStart(2, "0");
  $("#saved-count").textContent = String(saved.length).padStart(2, "0");
  $("#saved-filter-count").textContent = saved.length;
  $(".nav-count").textContent = scenes.length;
  $(".section-count").textContent = String(scenes.length).padStart(2, "0");
}
function renderMemories() {
  const results = scenes.filter(
    (scene) =>
      (filter === "全部" ||
        (filter === "已收藏"
          ? saved.includes(scene.id)
          : scene.type === filter)) &&
      `${scene.title} ${scene.subtitle} ${scene.clues.map((c) => c.name).join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  $("#memory-grid").innerHTML =
    results
      .map(
        (scene) =>
          `<button class="memory-card" data-scene="${scene.id}" aria-label="打开记忆：${escape(scene.title)}"><div class="memory-image"><img src="${scene.image}" alt="${escape(scene.title)}" loading="lazy"/><span class="card-clue-count">${icon("scan")} ${scene.clues.length} 条线索</span>${saved.includes(scene.id) ? `<span class="card-saved">${icon("check")} 已收藏</span>` : ""}</div><div class="memory-card-body"><span class="memory-category">${escape(scene.type)}</span><h3>${escape(scene.title)} ${icon("arrow")}</h3><p>${escape(scene.subtitle)}</p><div class="card-meta"><span>${icon("image")} ${scene.sessionOnly ? "本次会话" : "示例记忆"}</span><span>${scene.sessionOnly ? "手动标注" : "预设线索"}</span></div></div></button>`,
      )
      .join("") ||
    '<div class="empty-state">' +
      icon("search") +
      '<h3>还没有匹配的记忆</h3><p>试试其他关键词，或切换至「全部记忆」。</p><button class="button" id="reset-search">重置筛选</button></div>';
}
function setView(next) {
  view = next;
  const names = { overview: "概览", memories: "记忆库", clues: "视觉线索" };
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
    if (button.dataset.view === view)
      button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  $("#breadcrumb-current").textContent = names[view];
  $("#page-title").innerHTML =
    view === "overview"
      ? "让每一次看见，都成为记忆<span>。</span>"
      : view === "memories"
        ? "把值得记住的，留在这里<span>。</span>"
        : "从细节中，找到新的连接<span>。</span>";
  $("#page-description").textContent =
    view === "memories"
      ? "搜索、筛选与重访你的视觉记忆片段。"
      : view === "clues"
        ? "聚焦图像中的物体、空间与环境线索。"
        : "从图像中发现线索，为智能体构建更有上下文的记忆。";
  $("#explorer-section").hidden = view === "memories";
  $("#memory-section").hidden = view === "clues";
  history.replaceState(null, "", `#${view}`);
}
app.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-view]");
  if (nav) setView(nav.dataset.view);
  const clue = event.target.closest("[data-clue]");
  if (clue) {
    activeClue = Number(clue.dataset.clue);
    renderScene();
    const region = clue.closest("#annotations")
      ? $(`#annotations [data-clue="${activeClue}"]`)
      : $(`#clue-list [data-clue="${activeClue}"]`);
    region?.focus({ preventScroll: true });
  }
  const sceneButton = event.target.closest("[data-scene]");
  if (sceneButton) {
    activeScene = scenes.find((s) => s.id === sceneButton.dataset.scene);
    activeClue = 0;
    setView("overview");
    renderScene();
    $("#explorer-section").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
  const filterButton = event.target.closest("[data-filter]");
  if (filterButton) {
    filter = filterButton.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((el) => {
      el.classList.toggle("active", el === filterButton);
      el.setAttribute("aria-pressed", String(el === filterButton));
    });
    renderMemories();
  }
  if (event.target.closest("#reset-search")) {
    query = "";
    $("#memory-search").value = "";
    $('[data-filter="全部"]').click();
  }
});
$("#memory-search").addEventListener("input", (event) => {
  query = event.target.value.trim();
  renderMemories();
});
$("#switch-scene").addEventListener("click", () => {
  activeScene = scenes[(scenes.indexOf(activeScene) + 1) % scenes.length];
  activeClue = 0;
  renderScene();
});
$("#save-memory").addEventListener("click", () => {
  const exists = saved.includes(activeScene.id);
  saved = exists
    ? saved.filter((id) => id !== activeScene.id)
    : [...saved, activeScene.id];
  let persisted = true;
  try {
    localStorage.setItem(
      "aevmem-saved",
      JSON.stringify(
        saved.filter(
          (id) => !scenes.find((scene) => scene.id === id)?.sessionOnly,
        ),
      ),
    );
  } catch {
    persisted = false;
  }
  renderScene();
  renderMemories();
  toast(
    exists
      ? "已取消收藏"
      : activeScene.sessionOnly || !persisted
        ? "已收藏 · 仅保留在本次会话"
        : "已收藏，随时可在记忆库中找回",
  );
});
$("#upload-button").addEventListener("click", () => $("#file-input").click());
$("#file-input").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 10 * 1024 * 1024
  ) {
    toast("请选择不超过 10 MB 的 JPG、PNG 或 WebP 图像");
    return;
  }
  const url = URL.createObjectURL(file);
  try {
    const probe = new Image();
    probe.src = url;
    await probe.decode();
  } catch {
    URL.revokeObjectURL(url);
    toast("无法读取这张图像，请选择有效的图片文件");
    return;
  }
  const upload = {
    id: `upload-${Date.now()}-${scenes.length}`,
    sessionOnly: true,
    title: file.name.replace(/\.[^.]+$/, "").slice(0, 80) || "我的图像",
    image: url,
    type: "本地图像",
    subtitle: "你的视觉记忆 · 点击图像手动添加线索",
    clues: [],
  };
  scenes.push(upload);
  activeScene = upload;
  activeClue = 0;
  setView("overview");
  renderScene();
  renderMemories();
  toast("图像已在本地打开，点击图像手动标注线索");
});
function openAnnotation(x = 40, y = 40) {
  marking = true;
  $("#annotation-form").reset();
  $("#annotation-x").value = Math.max(0, Math.min(80, x)).toFixed(2);
  $("#annotation-y").value = Math.max(0, Math.min(80, y)).toFixed(2);
  $("#annotation-dialog").showModal();
  $("#annotation-name").focus();
}
$("#add-clue").onclick = () => openAnnotation();
$("#image-stage").addEventListener("click", (event) => {
  if (!activeScene.sessionOnly || event.target.closest("button")) return;
  const bounds = $("#image-stage").getBoundingClientRect();
  openAnnotation(
    ((event.clientX - bounds.left) / bounds.width) * 100 - 10,
    ((event.clientY - bounds.top) / bounds.height) * 100 - 10,
  );
});
$("#annotation-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#annotation-name").value.trim();
  if (!name || !marking) return;
  activeScene.clues.push({
    name,
    category: "手动线索",
    detail:
      $("#annotation-description").value.trim() || "由你手动记录的视觉线索。",
    box: [
      Number($("#annotation-x").value),
      Number($("#annotation-y").value),
      20,
      20,
    ],
    color: ["green", "orange", "blue"][activeScene.clues.length % 3],
  });
  activeClue = activeScene.clues.length - 1;
  marking = false;
  $("#annotation-dialog").close();
  renderScene();
  renderMemories();
  toast("线索已添加 · 仅保留在本次会话");
});
$("#cancel-annotation").onclick = () => {
  marking = false;
  $("#annotation-dialog").close();
};
for (const button of ["#guide-button", "#help-button"])
  $(button).onclick = () => $("#help-dialog").showModal();
$(".dialog-done").onclick = () => $("#help-dialog").close();
document
  .querySelectorAll(".dialog-close")
  .forEach(
    (button) => (button.onclick = () => button.closest("dialog").close()),
  );
$("#expand-image").onclick = () => {
  $("#image-dialog img").src = activeScene.image;
  $("#image-dialog img").alt = activeScene.title;
  $("#image-dialog").showModal();
};
document.addEventListener("keydown", (event) => {
  if (
    event.key === "/" &&
    !document.querySelector("dialog[open]") &&
    !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
  ) {
    event.preventDefault();
    setView("memories");
    $("#memory-search").focus();
  }
});
$(".brand").addEventListener("click", () => setView("overview"));
function syncHash() {
  setView(
    ["overview", "memories", "clues"].includes(location.hash.slice(1))
      ? location.hash.slice(1)
      : "overview",
  );
}
window.addEventListener("hashchange", syncHash);
syncHash();
renderScene();
renderMemories();
