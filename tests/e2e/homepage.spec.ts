import { expect, test } from "@playwright/test";

test("homepage shows hybrid catalog and quick drop zone", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Video Tools" })).toBeVisible();
  await expect(page.getByText("Media Info")).toBeVisible();
  await expect(page.getByText("Drop a video or audio file")).toBeVisible();
  await expect(page.getByText("Files stay on your device")).toBeVisible();
});
