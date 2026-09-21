/* ============================================================================
   年度修习 · 数据仓库（2026-09-21 建立）
   —— 来源：用户《AI + GIS/CAD 软件开发：完整学习路线·三层表》（xlsx，三张工作表）。
   ⚠️ 本文件只放**数据**，不放视觉与逻辑（那些在 index.html / knowledge.js）。
   ⚠️ 用户的明确要求：**不要出现时间**（"建议周期""第几周"一律不收录）——
      "时间不能成为我的负担"。故 courses / tools 里的"建议学习时间"列已舍弃。
   ⚠️ 台阶坐标 x/y = 占**背景图**的百分比（图 = assets/hall-great.webp，1438×864），
      沿画面**左环梯**的螺旋自下而上排布；改坐标只动这里。
   ⚠️ 措辞一律照录原表，不改写、不压缩 —— 这些是要被反复读的原文。
   ========================================================================= */
window.STUDY_PLAN = {

  meta: {
    eyebrow: "Annual Curriculum",
    title: "年度修习",
    /* 表 01 第 2 行的"目标" */
    goal: "不做 AI 底层研发，而是掌握 AI 应用、AI Coding、Web、C#、GIS/CAD 与桌面软件开发，最终用 AI 独立完成中小型 GIS/CAD 软件项目。",
    /* 表 01 表尾「学习原则」—— 用户要求：做成前台的箴言，而非使用说明 */
    principle: "30% 课程/文档 + 70% 项目实践。课程只学到「能做」，深入知识在实际项目中按需补。Git、调试、AI Coding Agent 贯穿全年，不单独等到最后学习。",
    /* 表 02 表头的「使用方法」 */
    howto: "优先跟一套主课程做项目；同一阶段不要同时追 3–5 套教程。书籍主要用于查漏补缺，ArcGIS/CAD SDK 优先看官方文档与 Sample。"
  },

  /* ── 14 级台阶（表 01 的 14 行；x/y 为占图百分比，沿左环梯螺旋） ────────── */
  stages: [
    {
      n: 1, key: "AI应用基础", x: 16.0, y: 86.5,
      tech: "LLM/VLM；多模态；Token；Context Window；Prompt/Context Engineering；结构化输出；JSON；模型选择",
      why: "建立 AI 使用底层认知，后续所有 AI 工具都建立在这些概念上",
      level: "看到常见 AI 术语知道是什么、解决什么问题；能写结构化提示并判断模型适用场景",
      out: "建立个人 AI 工作规范与提示词模板库",
      gate: "能够把一个模糊需求拆成：目标、上下文、约束、输出格式、验收标准"
    },
    {
      n: 2, key: "AI调用与工具", x: 7.0, y: 78.0,
      tech: "API；SDK；Function/Tool Calling；Webhook；REST；权限；批处理；Token 成本",
      why: "把「聊天」升级成「让 AI 调用工具做事」",
      level: "能调用至少 1 个模型 API；能理解工具调用链；会看日志和费用",
      out: "做一个「文件 → AI → 结构化 JSON」小工具",
      gate: "能解释一次 AI 调用从输入到输出发生了什么"
    },
    {
      n: 3, key: "RAG与知识库", x: 4.5, y: 62.0,
      tech: "Embedding；Chunking；Vector DB；Retrieval；Rerank；Hybrid Search；RAG 评估",
      why: "让 AI 能够基于你的资料回答，适合文档、规范、业务知识库",
      level: "能搭出简单 RAG；知道召回、重排、上下文拼接各自负责什么",
      out: "本地/云端资料库问答 Demo",
      gate: "能解释「为什么检索到了错误资料、怎么改进」"
    },
    {
      n: 4, key: "Agent与Workflow", x: 9.5, y: 48.5,
      tech: "Agent；Planning；Memory；Multi-Agent；Workflow；Human-in-the-loop；Evaluation",
      why: "让 AI 从「回答」走向「执行多步骤任务」",
      level: "能使用 Agent 平台搭工作流；知道什么时候用 Workflow、什么时候用 Agent",
      out: "自动化资料审核 / 报告生成工作流",
      gate: "能把一个业务任务拆成节点、工具、状态与人工确认点"
    },
    {
      n: 5, key: "MCP与工具生态", x: 15.5, y: 40.5,
      tech: "MCP；MCP Client/Server；Resources；Tools；权限；连接外部系统",
      why: "未来把 GIS、CAD、数据库、文件系统暴露给 AI 的重要连接层",
      level: "会配置 MCP；理解 Client/Server；能接入至少 1 个现成 MCP",
      out: "AI 调用文件 / 数据库工具 Demo",
      gate: "能说清 AI 为什么需要 MCP 以及它与普通 API 的区别"
    },
    {
      n: 6, key: "Python与自动化", x: 15.5, y: 28.5,
      tech: "Python 语法；函数/类；异常；文件；JSON；requests；pandas/numpy；Excel；SQLite；ArcPy",
      why: "第一门核心开发语言，也是 GIS 自动化与 AI 应用的高性价比语言",
      level: "能读懂 AI 写的 Python；能独立修改、调试；能做脚本自动化",
      out: "GIS 批量数据检查器",
      gate: "能独立完成一个 500 行以内的实用脚本并调试"
    },
    {
      n: 7, key: "Web前端", x: 8.0, y: 15.0,
      tech: "HTML；CSS；JavaScript；DOM；Promise；async/await；Fetch；TypeScript；React；Vite；组件化",
      why: "为 Web GIS、后台管理、可视化界面打基础",
      level: "能读懂 React 项目；能让 AI 辅助完成页面、表单、接口联调",
      out: "GIS 数据管理 Web 页面",
      gate: "能完成列表、表单、路由、API 请求与基本状态管理"
    },
    {
      n: 8, key: "C#与.NET", x: 84.0, y: 86.5,
      tech: "C# 语法；OOP；接口；集合；LINQ；泛型；委托/事件；async/await；Task；.NET；NuGet；Debugger",
      why: "你的第二核心语言，连接 WPF、ArcGIS Pro SDK、AutoCAD .NET",
      level: "能读懂 AI 写的 C#；能自己改、调试和组织中小型项目",
      out: "C# 文件/数据处理工具",
      gate: "能独立修复一个中小型 C# 项目中的 Bug 并理解调用链"
    },
    {
      n: 9, key: "WPF与MVVM", x: 93.0, y: 78.0,
      tech: "XAML；布局；Binding；Command；DataGrid；TreeView；UserControl；MVVM；ICommand；ObservableCollection",
      why: "用于构建 Windows 桌面软件与 ArcGIS Pro 相关 UI",
      level: "能做规范的多页 / 多区域桌面界面；知道 UI 与业务逻辑如何分离",
      out: "WPF 数据处理桌面工具",
      gate: "能做出可操作界面并把业务逻辑从 View 分离"
    },
    {
      n: 10, key: "GIS开发基础", x: 95.5, y: 62.0,
      tech: "空间数据模型；SHP/GDB/GeoJSON/Raster；Feature/Layer/Geometry；坐标系；WKID/EPSG；投影；Buffer/Clip/Intersect/Dissolve/Spatial Join",
      why: "把你的编程能力与 GIS 专业能力真正接起来",
      level: "能看懂 GIS 数据结构；能写基础空间处理程序；能定位常见坐标 / 几何问题",
      out: "GIS 数据质量检查程序",
      gate: "能解释一个 GIS 数据从文件到图层再到空间分析的完整链路"
    },
    {
      n: 11, key: "ArcGIS Pro插件", x: 90.5, y: 48.5,
      tech: "ArcGIS Pro SDK for .NET；Add-in；DAML；Map/Layer/Feature；Geometry；Geodatabase；EditOperation；Geoprocessing；DockPane；QueuedTask；MVVM",
      why: "这是你的核心专业开发方向之一",
      level: "能独立做简单到中等复杂度 Pro Add-in；能看官方 Sample 并改造成自己的功能",
      out: "ArcGIS Pro 数据质检插件",
      gate: "能完成 Ribbon / 按钮 / DockPane / 查询 / 编辑 / 日志 / 部署"
    },
    {
      n: 12, key: "AutoCAD插件", x: 84.5, y: 40.5,
      tech: "AutoCAD .NET API；Database；Document；Editor；Transaction；Entity；Layer；Block；Selection；Command；AutoLISP 基础",
      why: "满足 CAD 自动化、质检和插件开发目标",
      level: "能制作实用 CAD 插件；能批量处理图层、文字、块和图形",
      out: "CAD 数据质量检查插件",
      gate: "能做至少 3 个自定义命令并完成批量处理"
    },
    {
      n: 13, key: "独立GIS桌面软件", x: 84.5, y: 28.5,
      tech: "ArcGIS Maps SDK for .NET；WPF；MVVM；地图/图层/查询/编辑/空间分析；数据层；部署",
      why: "从「插件」升级为真正可独立运行的软件产品",
      level: "能设计软件结构并完成可运行 MVP",
      out: "独立 GIS 桌面工具",
      gate: "能打包运行；界面、业务、GIS 能力分层清晰"
    },
    {
      n: 14, key: "AI与GIS/CAD整合", x: 92.0, y: 15.0,
      tech: "LLM API；Tool Calling；MCP；Agent；GIS/CAD Tools；Evaluation；日志；成本；权限；Fallback",
      why: "把前面的全部能力汇聚成你的最终竞争力",
      level: "AI 可以调用你的 GIS/CAD 工具；你能控制、验证、审计 AI 执行结果",
      out: "AI GIS/CAD 智能助手",
      gate: "完成一个可演示、可复现、可维护的综合项目"
    }
  ],

  /* ── 修习条目（全局清单，2026-09-21 新增）━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ⭐ **从上面 stages 的三列派生，原文照录、一字不改写**（用户选定"从原表派生"）。
     派生规则（日后改 stages 的这三列，请同步改这里）：
       L = stages[].level 「掌握到的程度」 → 自问"我看懂了吗"
       O = stages[].out   「阶段产出」     → 自问"我做出来了吗"
       G = stages[].gate  「进入下一阶段的条件」 → 自问"我能往下走了吗"
     拆分口径：字段里若用「；」并列了**独立的两件事**，就拆成两条（一条一件事才好勾）；
               其余原样保留（含「、」「／」「：」与全角括号）。
     ⚠️ 页面上**绝不出现**：剩余条数 / 完成度百分比 / 逾期 / 连续打卡 / "今天该做"。
        勾选的语义是**记录**（"这一条我认了"），不是欠债 —— 用户设计原则原话：
        **"计划由我制定，修习由我完成，年度只负责记录。"**
     ⚠️ 表 02 那条「贯穿全程（工具）」（Git）**有意不进清单**：它原表措辞带时间
        （"从第 2 个月开始"），与本页"不出现时间"冲突；它留在学习资料里。
     ⚠️ 分组不在这里 —— 按 n 落到 knowledge.js 的 KST_GROUPS 四个方向。 */
  tasks: [
    /* 第 01 级 · AI应用基础 */
    { id: "s1l1", n: 1, k: "L", text: "看到常见 AI 术语知道是什么、解决什么问题" },
    { id: "s1l2", n: 1, k: "L", text: "能写结构化提示并判断模型适用场景" },
    { id: "s1o", n: 1, k: "O", text: "建立个人 AI 工作规范与提示词模板库" },
    { id: "s1g", n: 1, k: "G", text: "能够把一个模糊需求拆成：目标、上下文、约束、输出格式、验收标准" },
    /* 第 02 级 · AI调用与工具 */
    { id: "s2l1", n: 2, k: "L", text: "能调用至少 1 个模型 API" },
    { id: "s2l2", n: 2, k: "L", text: "能理解工具调用链" },
    { id: "s2l3", n: 2, k: "L", text: "会看日志和费用" },
    { id: "s2o", n: 2, k: "O", text: "做一个「文件 → AI → 结构化 JSON」小工具" },
    { id: "s2g", n: 2, k: "G", text: "能解释一次 AI 调用从输入到输出发生了什么" },
    /* 第 03 级 · RAG与知识库 */
    { id: "s3l1", n: 3, k: "L", text: "能搭出简单 RAG" },
    { id: "s3l2", n: 3, k: "L", text: "知道召回、重排、上下文拼接各自负责什么" },
    { id: "s3o", n: 3, k: "O", text: "本地/云端资料库问答 Demo" },
    { id: "s3g", n: 3, k: "G", text: "能解释「为什么检索到了错误资料、怎么改进」" },
    /* 第 04 级 · Agent与Workflow */
    { id: "s4l1", n: 4, k: "L", text: "能使用 Agent 平台搭工作流" },
    { id: "s4l2", n: 4, k: "L", text: "知道什么时候用 Workflow、什么时候用 Agent" },
    { id: "s4o", n: 4, k: "O", text: "自动化资料审核 / 报告生成工作流" },
    { id: "s4g", n: 4, k: "G", text: "能把一个业务任务拆成节点、工具、状态与人工确认点" },
    /* 第 05 级 · MCP与工具生态 */
    { id: "s5l1", n: 5, k: "L", text: "会配置 MCP" },
    { id: "s5l2", n: 5, k: "L", text: "理解 Client/Server" },
    { id: "s5l3", n: 5, k: "L", text: "能接入至少 1 个现成 MCP" },
    { id: "s5o", n: 5, k: "O", text: "AI 调用文件 / 数据库工具 Demo" },
    { id: "s5g", n: 5, k: "G", text: "能说清 AI 为什么需要 MCP 以及它与普通 API 的区别" },
    /* 第 06 级 · Python与自动化 */
    { id: "s6l1", n: 6, k: "L", text: "能读懂 AI 写的 Python" },
    { id: "s6l2", n: 6, k: "L", text: "能独立修改、调试" },
    { id: "s6l3", n: 6, k: "L", text: "能做脚本自动化" },
    { id: "s6o", n: 6, k: "O", text: "GIS 批量数据检查器" },
    { id: "s6g", n: 6, k: "G", text: "能独立完成一个 500 行以内的实用脚本并调试" },
    /* 第 07 级 · Web前端 */
    { id: "s7l1", n: 7, k: "L", text: "能读懂 React 项目" },
    { id: "s7l2", n: 7, k: "L", text: "能让 AI 辅助完成页面、表单、接口联调" },
    { id: "s7o", n: 7, k: "O", text: "GIS 数据管理 Web 页面" },
    { id: "s7g", n: 7, k: "G", text: "能完成列表、表单、路由、API 请求与基本状态管理" },
    /* 第 08 级 · C#与.NET */
    { id: "s8l1", n: 8, k: "L", text: "能读懂 AI 写的 C#" },
    { id: "s8l2", n: 8, k: "L", text: "能自己改、调试和组织中小型项目" },
    { id: "s8o", n: 8, k: "O", text: "C# 文件/数据处理工具" },
    { id: "s8g", n: 8, k: "G", text: "能独立修复一个中小型 C# 项目中的 Bug 并理解调用链" },
    /* 第 09 级 · WPF与MVVM */
    { id: "s9l1", n: 9, k: "L", text: "能做规范的多页 / 多区域桌面界面" },
    { id: "s9l2", n: 9, k: "L", text: "知道 UI 与业务逻辑如何分离" },
    { id: "s9o", n: 9, k: "O", text: "WPF 数据处理桌面工具" },
    { id: "s9g", n: 9, k: "G", text: "能做出可操作界面并把业务逻辑从 View 分离" },
    /* 第 10 级 · GIS开发基础 */
    { id: "s10l1", n: 10, k: "L", text: "能看懂 GIS 数据结构" },
    { id: "s10l2", n: 10, k: "L", text: "能写基础空间处理程序" },
    { id: "s10l3", n: 10, k: "L", text: "能定位常见坐标 / 几何问题" },
    { id: "s10o", n: 10, k: "O", text: "GIS 数据质量检查程序" },
    { id: "s10g", n: 10, k: "G", text: "能解释一个 GIS 数据从文件到图层再到空间分析的完整链路" },
    /* 第 11 级 · ArcGIS Pro插件 */
    { id: "s11l1", n: 11, k: "L", text: "能独立做简单到中等复杂度 Pro Add-in" },
    { id: "s11l2", n: 11, k: "L", text: "能看官方 Sample 并改造成自己的功能" },
    { id: "s11o", n: 11, k: "O", text: "ArcGIS Pro 数据质检插件" },
    { id: "s11g", n: 11, k: "G", text: "能完成 Ribbon / 按钮 / DockPane / 查询 / 编辑 / 日志 / 部署" },
    /* 第 12 级 · AutoCAD插件 */
    { id: "s12l1", n: 12, k: "L", text: "能制作实用 CAD 插件" },
    { id: "s12l2", n: 12, k: "L", text: "能批量处理图层、文字、块和图形" },
    { id: "s12o", n: 12, k: "O", text: "CAD 数据质量检查插件" },
    { id: "s12g", n: 12, k: "G", text: "能做至少 3 个自定义命令并完成批量处理" },
    /* 第 13 级 · 独立GIS桌面软件 */
    { id: "s13l1", n: 13, k: "L", text: "能设计软件结构并完成可运行 MVP" },
    { id: "s13o", n: 13, k: "O", text: "独立 GIS 桌面工具" },
    { id: "s13g1", n: 13, k: "G", text: "能打包运行" },
    { id: "s13g2", n: 13, k: "G", text: "界面、业务、GIS 能力分层清晰" },
    /* 第 14 级 · AI与GIS/CAD整合 */
    { id: "s14l1", n: 14, k: "L", text: "AI 可以调用你的 GIS/CAD 工具" },
    { id: "s14l2", n: 14, k: "L", text: "你能控制、验证、审计 AI 执行结果" },
    { id: "s14o", n: 14, k: "O", text: "AI GIS/CAD 智能助手" },
    { id: "s14g", n: 14, k: "G", text: "完成一个可演示、可复现、可维护的综合项目" }
  ],

  /* ── 课程与资料（表 02，17 条；`stage` 用于和台阶匹配） ─────────────────── */
  courses: [
    { order: "01", stage: "AI应用基础", content: "LLM/VLM、Prompt、Context、Structured Output",
      search: "2026 大模型 AI应用入门；Prompt Engineering；Context Engineering；多模态 AI",
      rec: "选 1 套 2026 新课做通识；重点看概念 + 实践，不追模型训练",
      book: "不建议买 AI 原理纸书作为主线",
      url: "https://www.bilibili.com/video/BV1HwhA6tEiR/",
      how: "1 遍课程 + 自己整理术语表 + 做 3 个提示模板",
      done: "能独立写出需求/上下文/约束/输出/验收标准" },
    { order: "02", stage: "AI调用与工具", content: "模型 API、JSON、Function Calling、Webhook、成本",
      search: "大模型 API 调用；Function Calling；Tool Calling；结构化输出 JSON",
      rec: "选一套 API 入门课；用一个模型 API 做结构化抽取",
      book: "—",
      url: "https://developers.openai.com/zh-Hans/api/docs/guides/tools",
      how: "跟着做一个「文本 → JSON」Demo",
      done: "能完成一次真实 API 调用并处理异常" },
    { order: "03", stage: "RAG与知识库", content: "Embedding、Chunking、向量库、检索、Rerank",
      search: "RAG 入门 实战；Embedding 向量数据库；Rerank",
      rec: "优先实战课 + 官方文档；先做小型本地资料库",
      book: "—",
      url: "https://python.langchain.com/",
      how: "围绕自己的资料构建 RAG",
      done: "能解释召回 / 重排 / 上下文拼接" },
    { order: "04", stage: "Agent与Workflow", content: "Agent、Planning、Memory、Workflow、Evaluation",
      search: "2026 AI Agent 零基础；Agent 实战；MCP Agent",
      rec: "【推荐】2026 最新版 AI Agent 全套：覆盖 Prompt/RAG/Agent/MCP；只学与你目标相关章节",
      book: "—",
      url: "https://www.bilibili.com/video/BV1HwhA6tEiR/",
      how: "删掉微调等与目标无关内容",
      done: "能自己搭一个多步骤 Agent" },
    { order: "05", stage: "MCP与工具生态", content: "工作流、AI 节点、Agent、MCP",
      search: "2026 n8n AI 工作流；Dify Agent 工作流",
      rec: "【推荐】2026 n8n 入门 + 实战，包含 AI、Agent、MCP",
      book: "—",
      url: "https://www.bilibili.com/video/BV1KMdfBEEUP/",
      how: "先拖拉节点，再补少量代码节点",
      done: "能完成 文件 → AI → 判断 → Excel/通知" },
    { order: "06", stage: "Python与自动化", content: "基础语法、函数、类、文件、requests、pandas、Excel",
      search: "2026 Python 零基础；Python pandas requests openpyxl",
      rec: "【推荐】2026 Python 零基础 100 集课程；完成基础语法后立刻转项目",
      book: "《Python编程：从入门到实践》",
      url: "https://www.bilibili.com/video/BV1tQfiB8Evj/",
      how: "视频做主线，书做练习 / 查漏",
      done: "能写 500 行以内实用脚本并调试" },
    { order: "07", stage: "Web前端", content: "HTML 语义、CSS 布局、JS 语法、DOM、Promise、Fetch",
      search: "黑马 HTML CSS；JavaScript 高级；前端零基础",
      rec: "黑马前端基础路线：HTML5+CSS3 → JavaScript",
      book: "《JavaScript高级程序设计》第 4 版",
      url: "https://www.bilibili.com/opus/505281023816873545",
      how: "做一个 GIS 风格后台页面",
      done: "能完成页面布局、表单、事件、API 请求" },
    { order: "08", stage: "Web前端", content: "TS 类型、React 组件、Hooks、Router、Vite",
      search: "黑马 React18 入门到实战；TypeScript 零基础",
      rec: "【推荐】黑马 React18 入门到实战 + TypeScript 配套课",
      book: "—",
      url: "https://www.bilibili.com/video/BV1ZB4y1Z7o8/",
      how: "JS 基础过关再学，不要从 Vue/React 同时起步",
      done: "能做完整前端管理页面并调用 API" },
    { order: "09", stage: "Web前端", content: "ArcGIS Maps SDK for JavaScript、Map/Layer/Query/Graphics",
      search: "ArcGIS Maps SDK JavaScript 5.1 React；ArcGIS JS React Vite",
      rec: "直接看 Esri 官方 React/Vite 教程和 Samples",
      book: "—",
      url: "https://developers.arcgis.com/javascript/latest/react/",
      how: "官方文档 + Sample 优先；B 站只补基础",
      done: "能做 React + ArcGIS 地图页面" },
    { order: "10", stage: "C#与.NET", content: "OOP、接口、LINQ、泛型、委托/事件、async/await、Task",
      search: "2026 C# 零基础；刘铁猛 C# 语言入门",
      rec: "【推荐】2026 C# 零基础入门；理解不够再补刘铁猛",
      book: "《深入理解C#》",
      url: "https://www.bilibili.com/video/BV1s1z6BHEfV/",
      how: "新课跑一遍，刘铁猛用于补理解",
      done: "能读 / 改 / 调试 AI 生成的 C# 项目" },
    { order: "11", stage: "WPF与MVVM", content: "XAML、Binding、Command、布局、控件、MVVM",
      search: "刘铁猛 深入浅出WPF；WPF MVVM Prism",
      rec: "【推荐】刘铁猛《深入浅出WPF》，再看 MVVM/Prism 实战",
      book: "《深入浅出WPF》",
      url: "https://www.bilibili.com/video/BV1ht411e7Fe/",
      how: "边学边做一个桌面工具",
      done: "能把 UI、ViewModel、Service 分开" },
    { order: "12", stage: "GIS开发基础", content: "空间数据、坐标系、空间分析、ArcPy 自动化",
      search: "ArcPy 从入门到精通；ArcGIS Pro ArcPy；GIS Python 自动化",
      rec: "B 站用于入门，Esri ArcPy 文档用于实战",
      book: "—",
      url: "https://pro.arcgis.com/en/pro-app/latest/arcpy/main/arcgis-pro-arcpy-reference.htm",
      how: "用自己的 GDB / 数据做练习",
      done: "能批量检查 / 处理真实 GIS 数据" },
    { order: "13", stage: "ArcGIS Pro插件", content: "Pro SDK .NET、Add-in、DAML、DockPane、Map/Layer/Feature、QueuedTask、MVVM",
      search: "ArcGIS Pro SDK C#；ArcGIS Pro 二次开发；ArcGIS Pro SDK 3.7",
      rec: "【强烈推荐】Esri 官方 API Reference + Community Samples；B 站只补概念",
      book: "—",
      url: "https://pro.arcgis.com/en/pro-app/3.7/sdk/api-reference/",
      url2: "https://github.com/esri/arcgis-pro-sdk-community-samples",
      how: "以官方 Sample 为教材，复制 → 运行 → 改造",
      done: "能独立做按钮、DockPane、查询、编辑、部署" },
    { order: "14", stage: "AutoCAD插件", content: "Database、Document、Editor、Transaction、Entity、Layer、Block、Command",
      search: "AutoCAD C# 二次开发；AutoCAD .NET API；CAD 插件开发",
      rec: "【推荐】AutoCAD 二次开发 C#.NET 基础篇；再配官方 Managed .NET API",
      book: "—",
      url: "https://www.bilibili.com/video/BV1CFvaBjEpx/",
      url2: "https://help.autodesk.com/cloudhelp/2026/ENU/OARX-DevGuide-Managed/files/GUID-390A47DB-77AF-433A-994C-2AFBBE9996AE.htm",
      how: "以「CAD 数据质检插件」为主线",
      done: "能开发 3 个以上实用命令 + 批量处理" },
    { order: "15", stage: "独立GIS桌面软件", content: "ArcGIS Maps SDK for .NET、WPF、MVVM、地图/图层/查询/编辑",
      search: "ArcGIS Maps SDK .NET WPF；ArcGIS SDK .NET 300.1",
      rec: "Esri 官方 300.x 文档 + WPF Samples",
      book: "—",
      url: "https://developers.arcgis.com/net/",
      url2: "https://developers.arcgis.com/net/wpf/sample-code/",
      how: "把前面插件 / 脚本能力产品化",
      done: "能完成独立运行 MVP" },
    { order: "16", stage: "AI与GIS/CAD整合", content: "Tool Calling、MCP、Agent、GIS/CAD 工具、日志、评测、成本",
      search: "AI GIS Agent；MCP Server C#；AI + GIS；AI + CAD",
      rec: "优先自己做，不再追新框架；把已有程序封装成工具",
      book: "—",
      url: "https://modelcontextprotocol.io/",
      how: "让 AI 真的调用你的工具，而不是只聊天",
      done: "完成 AI GIS/CAD 智能助手 Demo" },
    { order: "17", stage: "贯穿全程（工具）", content: "Git、GitHub、branch、commit、diff、PR、调试",
      search: "Git 教程；GitHub 教程；VS Code 调试；Visual Studio Debugger",
      rec: "选 1 套 Git 入门课；IDE 官方文档补工具能力",
      book: "—",
      url: "https://git-scm.com/doc",
      url2: "https://docs.github.com/",
      how: "从第 2 个月开始全程使用",
      done: "所有项目都有 Git 历史，能回滚 / 比对 / 分支" }
  ],

  /* ── 软件工具（表 03，29 条；pri = S/A/B，inst = 🟢/🟡/🔵） ────────────── */
  tools: [
    { name: "ChatGPT", cat: "AI对话/多模态", pri: "S", nature: "AI平台/网页+客户端", inst: "🟡 可直接网页使用；客户端可选", url: "https://chatgpt.com/", why: "复杂分析、学习、代码审查、图像/PDF/资料理解", learn: "项目规划；多模态；文件分析；代码解释；自定义工作流思路" },
    { name: "Claude", cat: "AI对话/长文本", pri: "A", nature: "AI平台/网页+客户端", inst: "🟡 可直接网页使用；客户端可选", url: "https://claude.ai/", why: "长文档和代码分析，作为第二意见", learn: "文件分析、代码审查、长上下文工作方式" },
    { name: "Gemini", cat: "AI对话/多模态", pri: "A", nature: "AI平台/网页+客户端", inst: "🟡 可直接网页使用；客户端可选", url: "https://gemini.google.com/", why: "第二意见、多模态与 Google 生态", learn: "图像 / 文档理解、长上下文、Google 工具衔接" },
    { name: "DeepSeek / Qwen / GLM / Kimi / Seed", cat: "国产AI模型", pri: "A", nature: "AI平台/模型服务", inst: "🟡 以网页/官方客户端为主；按实际平台选择", url: "各厂商官方平台", why: "中文任务、成本与模型分流", learn: "知道各自优势场景；会切换模型；不必逐个深学" },
    { name: "Claude Code", cat: "AI Coding Agent", pri: "S", nature: "终端AI编程工具", inst: "🟢 需要安装 CLI/相关运行环境", url: "https://docs.anthropic.com/en/docs/claude-code/overview", why: "终端式 AI 开发，适合复杂代码库和多步骤任务", learn: "项目上下文、文件修改、命令执行、Git、Agent 流程、安全权限" },
    { name: "OpenCode", cat: "AI Coding Agent", pri: "S", nature: "终端AI编程工具", inst: "🟢 需要安装 CLI", url: "https://opencode.ai/", why: "模型选择灵活，适合作为备用 / 替代 AI Coding Agent", learn: "模型配置、Agent 任务、终端操作、Git、MCP" },
    { name: "VS Code", cat: "代码编辑器", pri: "S", nature: "桌面软件/代码编辑器", inst: "🟢 需要下载安装", url: "https://code.visualstudio.com/", why: "Python、Web、Agent、MCP 的主工作台", learn: "扩展、终端、调试、Git、项目结构、Python/TS 开发" },
    { name: "Visual Studio 2026", cat: "IDE", pri: "S", nature: "桌面软件/专业IDE", inst: "🟢 需要下载安装", url: "https://visualstudio.microsoft.com/", why: "C#、WPF、ArcGIS Pro SDK、AutoCAD .NET 核心开发环境", learn: "解决方案、NuGet、Debugger、项目模板、发布、Git" },
    { name: "Git", cat: "版本控制", pri: "S", nature: "开发工具/命令行软件", inst: "🟢 需要下载安装", url: "https://git-scm.com/", why: "防止 AI 改崩代码；让你能回滚、比较、分支", learn: "clone、commit、branch、merge、diff、reset、log" },
    { name: "GitHub", cat: "代码托管/协作", pri: "S", nature: "云平台/网站", inst: "🔵 不需要安装；网页即可使用", url: "https://github.com/", why: "项目仓库、Issue、PR、Release、Actions", learn: "Repo、Issue、PR、Release、基础 Actions" },
    { name: "n8n", cat: "工作流自动化", pri: "S", nature: "工作流平台", inst: "🟡 云端可用；本地部署需要安装", url: "https://n8n.io/", why: "把文件、API、AI、数据库、通知编成自动化流程", learn: "节点、Webhook、HTTP、AI 节点、条件、循环、Code 节点、MCP" },
    { name: "Dify", cat: "AI应用平台", pri: "A", nature: "AI应用/Agent平台", inst: "🟡 云端可用；本地部署需要安装（常见为 Docker）", url: "https://dify.ai/", why: "快速搭 RAG、Agent、知识库应用", learn: "Workflow、Knowledge/RAG、Agent、API 发布" },
    { name: "Docker", cat: "开发/部署", pri: "A", nature: "桌面软件/容器运行时", inst: "🟢 需要下载安装", url: "https://www.docker.com/", why: "统一环境、运行数据库 / Agent 服务 / MCP Server", learn: "镜像、容器、Volume、Network、Compose" },
    { name: "Postman", cat: "API工具", pri: "A", nature: "桌面软件+Web工具", inst: "🟡 可安装桌面版；也可使用 Web", url: "https://www.postman.com/", why: "调试 AI API、GIS API、后端接口", learn: "请求、Header、Auth、Body、环境、Collection" },
    { name: "Node.js + npm", cat: "Web运行时/包管理", pri: "S", nature: "运行环境/命令行工具", inst: "🟢 需要下载安装 Node.js（npm 随附）", url: "https://nodejs.org/", why: "React、TypeScript、ArcGIS JS 开发基础", learn: "npm、package.json、脚本、依赖、版本" },
    { name: "Python", cat: "编程语言", pri: "S", nature: "编程语言/运行环境", inst: "🟢 需要下载安装 Python", url: "https://www.python.org/", why: "AI 应用、数据处理、GIS 自动化、ArcPy", learn: "语法、OOP、文件、HTTP、pandas、ArcPy、虚拟环境" },
    { name: "C#", cat: "编程语言", pri: "S", nature: "编程语言（不是独立软件）", inst: "🟢 需要安装 .NET SDK + IDE", url: "https://dotnet.microsoft.com/", why: "WPF、ArcGIS Pro SDK、AutoCAD .NET 的共同主力语言", learn: "OOP、LINQ、异步、集合、API、调试" },
    { name: "WPF", cat: "桌面UI框架", pri: "S", nature: ".NET UI框架（不是独立软件）", inst: "🔵 不单独下载安装；随 .NET/Visual Studio 开发", url: "https://learn.microsoft.com/dotnet/desktop/wpf/", why: "Windows 桌面 GIS/CAD 工具界面", learn: "XAML、布局、Binding、Command、MVVM" },
    { name: "ArcGIS Pro", cat: "GIS桌面软件", pri: "S", nature: "桌面GIS专业软件", inst: "🟢 需要下载安装", url: "https://www.esri.com/en-us/arcgis/products/arcgis-pro/overview", why: "专业 GIS 生产与插件运行平台", learn: "地图、图层、编辑、地理处理、属性、数据管理" },
    /* 2026-09-22 用户要求补：存量项目与实际工作里还在用的经典桌面 GIS。
       ⚠️ 退役时间已核（Esri 官方文档页原话）：**ArcGIS Desktop 已于 2026 年 3 月 1 日退役**，
          10.8.2 是末版；官方同时说明"有有效许可仍可继续使用"。 */
    { name: "ArcMap 10.8", cat: "GIS桌面软件", pri: "S", nature: "桌面GIS专业软件（ArcGIS Desktop 10.x，末代版本）", inst: "🟢 需要下载安装（在 My Esri 取安装包与授权码）", url: "https://desktop.arcgis.com/zh-cn/arcmap/latest/", why: "存量项目与实际工作里仍在大量使用的经典桌面 GIS —— 数据生产、成图出图、ArcPy 自动化都还在它上面（Esri 已于 2026-03-01 退役，有许可仍可继续用）", learn: "ArcMap / ArcCatalog 基本操作；数据框与图层；符号化与制图出图；ModelBuilder；ArcPy 自动化（⚠️ 10.8 的 ArcPy 跑在 Python 2.7 上，与 ArcGIS Pro 的 Python 3 是两套，不能混用）" },
    { name: "ArcGIS Pro SDK for .NET", cat: "GIS开发SDK", pri: "S", nature: "ArcGIS Pro 开发 SDK（不是独立业务软件）", inst: "🟢 需要安装匹配版本 SDK/开发环境", url: "https://developers.arcgis.com/documentation/arcgis-pro-sdk/", why: "开发 ArcGIS Pro 插件", learn: "Add-in、DAML、Map/Layer/Feature、DockPane、QueuedTask、Geodatabase" },
    { name: "ArcGIS Maps SDK for JavaScript", cat: "Web GIS SDK", pri: "A", nature: "Web 开发 SDK / npm 包", inst: "🔵 不单独下载桌面软件；项目内通过 npm 安装", url: "https://developers.arcgis.com/javascript/", why: "React Web GIS 与可视化应用", learn: "Map、View、Layer、Query、Graphic、Components" },
    { name: "ArcGIS Maps SDK for .NET", cat: "独立GIS SDK", pri: "S", nature: "桌面 GIS 开发 SDK / NuGet 包", inst: "🔵 不单独下载安装；在 .NET 项目中安装 SDK/NuGet", url: "https://developers.arcgis.com/net/", why: "构建不依赖 ArcGIS Pro 的 Windows GIS 软件", learn: "MapView、Layer、Query、Geometry、Geoprocessing、WPF 集成" },
    { name: "AutoCAD", cat: "CAD桌面软件", pri: "S", nature: "桌面CAD专业软件", inst: "🟢 需要下载安装", url: "https://www.autodesk.com/products/autocad/overview", why: "CAD 插件开发与验证平台", learn: "图层、块、实体、属性、命令、选择集等日常操作" },
    { name: "AutoCAD .NET API", cat: "CAD开发API/SDK", pri: "S", nature: "AutoCAD 开发 API（不是独立软件）", inst: "🔵 不作为独立软件学习；依托 AutoCAD/.NET 开发环境", url: "https://help.autodesk.com/", why: "用 C# 开发 CAD 插件", learn: "Application/Document/Database/Editor/Transaction/Entity/Layer/Block" },
    { name: "AutoLISP", cat: "CAD脚本语言", pri: "B", nature: "CAD 内置脚本语言（不是独立软件）", inst: "🔵 不单独下载安装；直接在 AutoCAD 环境中学习/运行", url: "https://help.autodesk.com/", why: "处理简单、重复性的 CAD 自动化", learn: "图层、文字、编号、批处理基础" },
    { name: "SQLite", cat: "数据库", pri: "A", nature: "嵌入式数据库/数据库引擎", inst: "🟡 开发时可直接使用库；需要 CLI/工具时再安装", url: "https://www.sqlite.org/", why: "桌面软件本地数据存储", learn: "表、CRUD、JOIN、索引、事务" },
    { name: "PostgreSQL + PostGIS", cat: "数据库/GIS", pri: "A", nature: "数据库软件+空间扩展", inst: "🟢 建议本地下载安装用于学习；生产环境可用服务器/云服务", url: "https://www.postgresql.org/", why: "中大型空间数据与服务端 GIS 数据", learn: "SQL、空间字段、空间查询、索引、基础 GIS 函数" },
    { name: "Google Cloud Code", cat: "云开发工具", pri: "B", nature: "IDE 插件/云开发工具", inst: "🟡 可选安装；只有进入 Google Cloud 路线再学", url: "https://cloud.google.com/code", why: "如果以后用 Google Cloud 开发才有明显价值", learn: "知道用途；会基本配置/部署，不作为当前主线" },
    { name: "Figma", cat: "UI设计", pri: "B", nature: "Web 应用/可选桌面客户端", inst: "🟡 网页直接使用；桌面版可选", url: "https://www.figma.com/", why: "快速设计软件界面、组件与页面原型", learn: "Frame、Auto Layout、Component、原型" }
  ],

  /* ── 阶段 → 要用到的软件（表 03 **没有**"阶段"列，这份对应关系是按各阶段主题整理的，
        可以随时调整；课程那边不用这张表 —— 表 02 自带「阶段」列，直接匹配即可） ───── */
  stageTools: {
    1:  ["ChatGPT", "Claude", "Gemini", "DeepSeek / Qwen / GLM / Kimi / Seed"],
    2:  ["ChatGPT", "Claude", "Postman", "VS Code"],
    3:  ["Dify", "Python", "VS Code"],
    4:  ["n8n", "Dify", "VS Code"],
    5:  ["n8n", "Claude Code", "OpenCode", "Docker"],
    6:  ["Python", "VS Code", "Git", "GitHub"],
    7:  ["VS Code", "Node.js + npm", "Git", "GitHub", "Figma"],
    8:  ["Visual Studio 2026", "C#", "Git", "GitHub"],
    9:  ["Visual Studio 2026", "WPF", "C#", "Figma"],
    10: ["ArcGIS Pro", "ArcMap 10.8", "Python", "VS Code", "SQLite"],
    11: ["ArcGIS Pro", "ArcGIS Pro SDK for .NET", "Visual Studio 2026", "C#", "WPF"],
    12: ["AutoCAD", "AutoCAD .NET API", "AutoLISP", "Visual Studio 2026", "C#"],
    13: ["ArcGIS Maps SDK for .NET", "WPF", "Visual Studio 2026", "C#", "SQLite", "PostgreSQL + PostGIS"],
    14: ["Claude Code", "OpenCode", "Docker", "PostgreSQL + PostGIS"]
  },

  /* ── 表 03 右侧「安装判断速查」面板（含"最终主力组合"） ─────────────────── */
  quick: {
    install: [
      { tag: "🟢 必须/建议安装", list: "VS Code；Visual Studio 2026；Git；Node.js；Python；ArcGIS Pro；AutoCAD；Docker；PostgreSQL/PostGIS（学习环境）" },
      { tag: "🟢 安装CLI/开发工具", list: "Claude Code；OpenCode；匹配版本的 ArcGIS Pro SDK" },
      { tag: "🟡 云端可用/本地可选", list: "ChatGPT；Claude；Gemini；n8n；Dify；Postman；SQLite；Figma；Google Cloud Code" },
      { tag: "🔵 不作为独立软件安装", list: "GitHub；C#（装 .NET SDK/IDE）；WPF；ArcGIS Maps SDK for JavaScript；ArcGIS Maps SDK for .NET；AutoCAD .NET API；AutoLISP" }
    ],
    rules: [
      { tag: "软件类", list: "先安装 → 跟课程操作 → 做项目；不要只看视频。" },
      { tag: "语言/框架/SDK", list: "先学概念，再在 IDE 里实际编码；SDK 以官方文档/示例为准。" },
      { tag: "AI 工具", list: "重点是形成固定工作流，不追求把所有 AI 软件全部学一遍。" }
    ],
    main: "VS Code + Visual Studio + Git/GitHub + Claude Code/OpenCode + Python/C# + ArcGIS Pro + AutoCAD + n8n/Dify"
  }
};
