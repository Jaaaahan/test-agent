# 视觉验证

## 基线与场景

- Before：基线提交 `2d3dfbe` 的真实仓库根路径。该提交只有 README，**不存在网页应用、旧版页面或可运行的旧 UI**；因此截图如实展示静态服务器的目录响应，而不是将新造的页面当作旧页面。
- After：代码提交 `aa015d6975ea8888ae1d9a7f4b957b87ee3ea56f`。截图为实际应用捕获，非设计稿；后续证据提交仅添加这些截图与本说明，不改变 UI。
- 场景：浏览器访问 `/`；After 为首次打开的概览、第一张示例、第一条线索、无收藏、无弹窗、滚动位置顶部。
- 两侧均为系统 Chromium、`zh-CN`、浅色主题、DPR 1；桌面 viewport 为 1440 × 1000，手机 viewport 为 390 × 844。
- `before-desktop.png` / `after-desktop.png` 与 `before-mobile.png` / `after-mobile.png` 为相同 viewport 的对应截图。`after-*-full.png` 是同一次捕获附加的整页截图，不用于伪装尺寸一致的比较。
- 基线无 UI，因此不能提供不存在的“旧应用操作演示”；Before 的比较范围仅限于真实的初始访问状态。

## 重现

从仓库根目录导出准确的基线，不修改当前分支：

```bash
mkdir -p /tmp/aevmem-baseline-2d3dfbe
git archive 2d3dfbe | tar -x -C /tmp/aevmem-baseline-2d3dfbe
python3 -m http.server 4174 --bind 127.0.0.1 --directory /tmp/aevmem-baseline-2d3dfbe
```

在另外的终端运行：

```bash
npm ci
npm run dev -- --port 4175 --strictPort
```

然后运行捕获脚本（默认使用系统 Chrome，支持 `CHROME_BIN`、`BASELINE_URL` 和 `APP_URL` 环境变量）：

```bash
node scripts/capture-evidence.js
```

截图不包含会话记录、凭据或用户图片。素材为公开示例。
