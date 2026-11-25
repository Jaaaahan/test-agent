import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:4176",
    viewport: { width: 1440, height: 1000 },
    locale: "zh-CN",
    colorScheme: "light",
    launchOptions: {
      executablePath: process.env.CHROME_BIN || undefined,
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command: "npm run dev -- --port 4176 --strictPort",
    url: "http://127.0.0.1:4176",
    reuseExistingServer: !process.env.CI,
  },
});
