# AEVMem · 视觉记忆工作台

一个面向「从图像中发现视觉线索」的中文前端原型。以图像、区域标注与场景记忆为中心，提供可直接体验的工作台，而非只有介绍文案的展示页。

> **当前是纯前端交互演示，不是已接入模型的记忆系统。** 示例线索为人工预设；上传图片可手动标注，不执行自动图像理解、向量检索或智能体记忆推理。没有后端、账号体系或云端存储，也尚未部署公共访问地址。

## 本地运行

需要 Node.js 22（或兼容 Vite 6 的 Node.js 版本）和 npm。

```bash
npm ci
npm run dev
```

打开终端实际输出的本地地址，通常为 `http://127.0.0.1:5173`。停止服务使用 `Ctrl+C`，重新运行 `npm run dev` 即可重启。

```bash
npm run build       # 生成 dist/ 静态产物
npm run preview     # 本地预览构建结果
```

构建结果可部署到静态网站托管服务；导航使用 URL hash，不需要服务器配置历史路由回退。当前 PR 不自动部署、不自动合并。

## 可以体验什么

- **概览、记忆库、视觉线索**三个视图，统计随会话中的操作更新。
- 在图像区域标注和右侧线索卡片之间切换，查看对应的记忆上下文。
- 切换三张示例场景、放大图像、按场景分类或关键词搜索、筛选已收藏记忆。
- 收藏示例记忆，刷新后可从当前浏览器的本地存储恢复；若浏览器禁用存储，则降级为当前会话收藏。
- 添加多张 JPG / PNG / WebP 图像（每张不超过 10 MB），点击图像添加线索；也可使用「手动添加线索」按钮和位置输入框完成键盘标注。
- 标注区域基于完整图像坐标，横竖图均不裁切，调整窗口大小不会改变线索对应的位置。
- 响应式布局、键盘焦点、原生对话框、`Escape` 关闭与 `/` 搜索快捷键。

**数据边界：**上传图片通过浏览器对象 URL 打开，不发送给任何服务器；上传图片、手动标注和对应收藏仅保留在当前页面会话，刷新后消失。示例收藏仅存储示例 ID。搜索是本地文字匹配，不是语义检索。示例图片随应用本地提供，运行时不依赖外部图片服务。

## 验证

```bash
npx playwright install chromium
npm test
```

如需使用已有 Chrome，可通过 `CHROME_BIN` 指定其绝对路径：

```bash
CHROME_BIN=/usr/bin/google-chrome npm test
```

测试覆盖线索同步、收藏持久化及降级、搜索与分类、导航、对话框、图片校验、隐私边界、文本转义、多图上传、键盘标注、竖图坐标与不同屏宽下的布局。GitHub Actions 执行依赖安装、生产构建与浏览器测试。

## 界面对比

基线提交 `2d3dfbe` 只有说明文档，**没有旧版网页应用**。Before 是该真实提交经静态服务器提供的根路径响应（目录列表），不是虚构的旧 UI。After 为本次实现的实际浏览器截图。

- [桌面 Before](<docs/evidence/before-desktop.png>) / [桌面 After](<docs/evidence/after-desktop.png>) / [完整桌面页面](<docs/evidence/after-desktop-full.png>)
- [手机 Before](<docs/evidence/before-mobile.png>) / [手机 After](<docs/evidence/after-mobile.png>) / [完整手机页面](<docs/evidence/after-mobile-full.png>)
- [捕获环境与重现方法](<docs/evidence/README.md>)

## 素材

演示图片来自 Unsplash，按 [Unsplash License](<https://unsplash.com/license>) 使用。原始图片链接见 [素材来源](<public/images/SOURCES.md>)。标注由本原型人工编写，仅用于交互展示，不代表任何模型的识别准确率或真实用户数据。
