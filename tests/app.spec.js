import { test, expect } from "@playwright/test";

const image = "public/images/workspace.jpg";

test("overview loads local images and synchronizes accessible clue controls", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "让每一次看见",
  );
  await expect(page.locator(".memory-card")).toHaveCount(3);
  await expect(page.locator("#clue-list button")).toHaveCount(3);
  await page.getByRole("button", { name: "02 共享茶水区" }).click();
  await expect(
    page.getByRole("button", { name: "定位：共享茶水区" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#clue-detail")).toContainText("右侧的冰箱");
  await page.getByRole("button", { name: "定位：木质书架" }).click();
  await expect(page.locator("#clue-list button").first()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(
    await page
      .locator(".image-stage > img, .memory-image > img")
      .evaluateAll((images) =>
        images.every((i) => i.complete && i.naturalWidth > 0),
      ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});

test("save and unsave persist and saved filter handles empty state", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "收藏这段记忆", exact: true }).click();
  await expect(page.locator("#saved-count")).toHaveText("01");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "已收藏 · 点击取消" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "已收藏 1", exact: true }).click();
  await expect(page.locator(".memory-card")).toHaveCount(1);
  await page.getByRole("button", { name: "已收藏 · 点击取消" }).click();
  await expect(
    page.getByRole("heading", { name: "还没有匹配的记忆" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "重置筛选" }).click();
  await expect(page.locator(".memory-card")).toHaveCount(3);
});

test("navigation, text search, filters, scene switching and keyboard search work", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "记忆库 3" }).click();
  await expect(page.locator("#explorer-section")).toBeHidden();
  await page.getByRole("textbox", { name: "搜索记忆" }).fill("书架");
  await expect(page.locator(".memory-card")).toHaveCount(1);
  await page.getByRole("textbox", { name: "搜索记忆" }).fill("无匹配内容");
  await expect(page.locator(".empty-state")).toBeVisible();
  await page.getByRole("button", { name: "重置筛选" }).click();
  await page.getByRole("button", { name: "生活场景", exact: true }).click();
  await expect(page.locator(".memory-card")).toHaveCount(2);
  await page.getByRole("button", { name: "打开记忆：街角咖啡馆" }).click();
  await expect(page.locator("#scene-title")).toHaveText("街角咖啡馆");
  await page.getByRole("button", { name: "切换示例" }).click();
  await expect(page.locator("#scene-title")).toHaveText("温暖的居家角落");
  await page.getByRole("button", { name: "视觉线索", exact: true }).click();
  await expect(page.locator("#memory-section")).toBeHidden();
  await page.keyboard.press("/");
  await expect(page.getByRole("textbox", { name: "搜索记忆" })).toBeFocused();
  await expect(page).toHaveURL(/#memories$/);
});

test("local upload supports manual annotation, escapes text and stays session-only", async ({
  page,
}) => {
  const remoteRequests = [];
  page.on("request", (request) => {
    if (
      !request.url().startsWith("http://127.0.0.1") &&
      !request.url().startsWith("blob:") &&
      !request.url().startsWith("data:")
    )
      remoteRequests.push(request.url());
  });
  await page.goto("/");
  await page.locator("#file-input").setInputFiles(image);
  await expect(page.locator("#sample-label")).toHaveText("点击图像添加线索");
  await expect(page.locator("#image-count")).toHaveText("04");
  await page.locator("#image-stage").click({ position: { x: 150, y: 150 } });
  await page
    .getByRole("textbox", { name: "线索名称" })
    .fill("<img src=x onerror=alert(1)>");
  await page
    .getByRole("textbox", { name: "记忆说明" })
    .fill("我手动记录的一段记忆。");
  await page.getByRole("button", { name: "添加线索", exact: true }).click();
  await expect(page.locator("#clue-list button")).toHaveCount(1);
  await expect(page.locator("#clue-detail")).toContainText("我手动记录");
  await expect(page.locator("#clue-list img")).toHaveCount(0);
  await page.getByRole("button", { name: "收藏这段记忆", exact: true }).click();
  await expect(page.locator("#toast")).toContainText("仅保留在本次会话");
  await page.reload();
  await expect(page.locator("#image-count")).toHaveText("03");
  await expect(page.locator("#saved-count")).toHaveText("00");
  expect(remoteRequests).toEqual([]);
});

test("invalid image files and unavailable storage do not break the app", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage blocked");
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "收藏这段记忆", exact: true }).click();
  await expect(page.locator("#toast")).toContainText("仅保留在本次会话");
  await page
    .locator("#file-input")
    .setInputFiles({
      name: "bad.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("not an image"),
    });
  await expect(page.locator("#toast")).toContainText("无法读取这张图像");
  await page
    .locator("#file-input")
    .setInputFiles({
      name: "large.png",
      mimeType: "image/png",
      buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
    });
  await expect(page.locator("#toast")).toContainText("不超过 10 MB");
  await expect(page.locator("#image-count")).toHaveText("03");
});

test("help and enlarged image dialogs support Escape and restore focus", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "使用帮助" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "使用帮助" })).toBeFocused();
  await page.getByRole("button", { name: "放大图像" }).click();
  await expect(page.locator("#image-dialog")).toBeVisible();
  await page.getByRole("button", { name: "关闭大图" }).click();
  await expect(page.locator("#image-dialog")).not.toBeVisible();
});

test("multiple uploads retain independent clues and saved state with keyboard annotation", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#file-input").setInputFiles(image);
  await page.getByRole("button", { name: "手动添加线索" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("textbox", { name: "线索名称" }).fill("第一张的线索");
  await page.getByRole("spinbutton", { name: "水平位置" }).fill("12");
  await page.getByRole("spinbutton", { name: "垂直位置" }).fill("64");
  await page.getByRole("button", { name: "添加线索", exact: true }).click();
  await page.getByRole("button", { name: "收藏这段记忆", exact: true }).click();
  await page.locator("#file-input").setInputFiles("public/images/cafe.jpg");
  await expect(page.locator("#image-count")).toHaveText("05");
  await expect(page.locator("#clue-list button")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "收藏这段记忆", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page
    .getByRole("button", { name: "打开记忆：workspace", exact: true })
    .click();
  await expect(page.locator("#clue-list")).toContainText("第一张的线索");
  await expect(
    page.getByRole("button", { name: "已收藏 · 点击取消" }),
  ).toBeVisible();
});

test("portrait image remains uncropped and annotations stay in image coordinates on resize", async ({
  page,
}) => {
  await page.goto("/");
  const buffer = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#bcd";
    ctx.fillRect(0, 0, 300, 1200);
    return Array.from(
      new Uint8Array(
        await (
          await new Promise((resolve) => canvas.toBlob(resolve))
        ).arrayBuffer(),
      ),
    );
  });
  await page
    .locator("#file-input")
    .setInputFiles({
      name: "portrait.png",
      mimeType: "image/png",
      buffer: Buffer.from(buffer),
    });
  await page.getByRole("button", { name: "手动添加线索" }).click();
  await page.getByRole("textbox", { name: "线索名称" }).fill("底部细节");
  await page.getByRole("spinbutton", { name: "垂直位置" }).fill("75");
  await page.getByRole("button", { name: "添加线索", exact: true }).click();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const dimensions = await page.locator("#scene-image").evaluate((img) => {
      const rect = img.getBoundingClientRect();
      const stage = img.parentElement.getBoundingClientRect();
      const mark = img.parentElement
        .querySelector(".annotation")
        .getBoundingClientRect();
      return {
        ratio: rect.width / rect.height,
        y: (mark.top - stage.top) / stage.height,
      };
    });
    expect(dimensions.ratio).toBeCloseTo(0.25, 2);
    expect(dimensions.y).toBeCloseTo(0.75, 2);
  }
});

test("hash changes synchronize the visible view", async ({ page }) => {
  await page.goto("/#memories");
  await page.evaluate(() => {
    location.hash = "clues";
  });
  await expect(page.locator("#breadcrumb-current")).toHaveText("视觉线索");
  await expect(page.locator("#explorer-section")).toBeVisible();
  await expect(page.locator("#memory-section")).toBeHidden();
});

for (const width of [390, 768, 1440]) {
  test(`layout has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.getByRole("button", { name: "02 共享茶水区" }).click();
    await expect(page.locator("#clue-detail")).toContainText("冰箱");
  });
}
