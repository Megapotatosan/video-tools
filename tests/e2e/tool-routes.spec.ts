import { expect, test } from "@playwright/test";

const slugs = ["media-info", "convert-video", "compress-video", "trim-video", "extract-audio"];

for (const slug of slugs) {
  test(`renders ${slug}`, async ({ page }) => {
    await page.goto(`/tools/${slug}`);
    await expect(page.getByTestId("tool-runner")).toBeVisible();
    await expect(page.getByText("Engine plan")).toBeVisible();
    await expect(page.getByText("Drop a file to calculate the local processing path.")).toBeVisible();
  });
}
