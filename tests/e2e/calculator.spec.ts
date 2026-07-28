import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("주택형 변경 시 공식 발코니 확장비를 자동 적용한다", async ({ page }) => {
  page.on("dialog", (dialog) => dialog.accept());
  const housingType = page.getByLabel("주택형");
  const extensionCost = page.getByLabel("발코니 확장비");

  const cases = [
    ["59B", "8,790,000"],
    ["84A", "10,290,000"],
    ["84B", "8,440,000"],
    ["59A", "8,290,000"],
  ] as const;

  for (const [type, expected] of cases) {
    await housingType.selectOption(type);
    await expect(extensionCost).toHaveValue(expected);
  }
});

test("직접 입력 모드는 현재 입력값으로 잔금을 자동 계산한다", async ({ page }) => {
  await page.getByRole("radio", { name: "직접 입력", exact: true }).check();
  await page.getByRole("textbox", { name: "분양가" }).fill("400000000");
  await page.getByRole("button", { name: "중도금 납부 상태" }).click();

  const balanceRow = page.getByText("자동 계산 잔금").locator("..");
  await expect(balanceRow).toContainText("148,700,000원");
  await expect(page.getByText("납부일정 합계").locator("..")).toContainText(
    "400,000,000원",
  );
});

test("시행사 납부액 초과 검증에 중도금 대출 납부액을 포함한다", async ({ page }) => {
  await page.getByRole("radio", { name: "직접 입력", exact: true }).check();
  await page.getByRole("radio", { name: "총액 직접 입력" }).check();
  await page.getByLabel("총 계약금액").fill("200000000");

  await expect(page.locator("aside.warning[role='alert']")).toContainText(
    "중도금 대출 포함",
  );
});

test("결과 문구와 미입력 항목 안내를 표시한다", async ({ page }) => {
  await expect(
    page.getByText("현재 입력 기준 준비 현금", { exact: true }),
  ).toHaveCount(2);
  await expect(page.getByRole("note", { name: "미입력 항목 안내" })).toContainText(
    "취득세율이 입력되지 않아",
  );
  await expect(page.getByRole("note", { name: "미입력 항목 안내" })).toContainText(
    "잔금대출 예정금액이 입력되지 않아",
  );
});

test("잔금대출을 분양가와 확장비 합계의 비율로 입력한다", async ({ page }) => {
  await page.getByRole("radio", { name: "분양가+확장비 비율" }).check();
  await page.getByLabel("잔금대출 비율").fill("70");

  await expect(page.getByText("비율 계산 기준금액").locator("..")).toContainText(
    "367,290,000원",
  );
  await expect(page.getByText("자동 계산 잔금대출").locator("..")).toContainText(
    "257,103,000원",
  );
  await expect(
    page.getByRole("note", { name: "미입력 항목 안내" }),
  ).not.toContainText("잔금대출 예정금액이 입력되지 않아");
});

test("세율을 소수점 둘째 자리까지 순차 입력할 수 있다", async ({ page }) => {
  await page
    .locator("details.section-card:has(#acquisitionRate) > summary")
    .click();
  const acquisitionRate = page.getByLabel("취득세율");

  await acquisitionRate.fill("");
  await acquisitionRate.pressSequentially("1.25");

  await expect(acquisitionRate).toHaveValue("1.25");
  await expect(
    page.getByRole("note", { name: "미입력 항목 안내" }),
  ).not.toContainText("취득세율이 입력되지 않아");
});

test("지방교육세 감면금액을 세율 계산 결과에서 차감한다", async ({ page }) => {
  await page
    .locator("details.section-card:has(#acquisitionRate) > summary")
    .click();

  await page
    .getByRole("textbox", { name: "지방교육세율", exact: true })
    .fill("0.1");
  await page.getByLabel("지방교육세 감면금액").fill("100000");

  await expect(
    page.locator(".mini-results").filter({ hasText: "감면 후 지방교육세" }),
  ).toContainText("267,290원");
});

test("농어촌특별세를 선택한 과세표준의 세율로 계산한다", async ({ page }) => {
  await page
    .locator("details.section-card:has(#acquisitionRate) > summary")
    .click();

  await page.getByRole("radio", { name: "세율로 계산" }).check();
  await page
    .getByLabel("농어촌특별세 계산 기준")
    .selectOption("contract");
  await page.getByLabel("농어촌특별세율").fill("0.2");

  await expect(
    page.locator(".mini-results").filter({ hasText: "농어촌특별세" }),
  ).toContainText("734,580원");
});

test("전체 초기화 전에 확인하고 취소 또는 승인할 수 있다", async ({ page }) => {
  const optionCost = page.getByLabel("유상 옵션비");
  await optionCost.fill("1230000");

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("모든 금액과 선택값을 초기화");
    await dialog.dismiss();
  });
  await page.getByRole("button", { name: "전체 초기화" }).click();
  await expect(optionCost).toHaveValue("1,230,000");

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "전체 초기화" }).click();
  await expect(page.getByLabel("유상 옵션비")).toHaveValue("");
});

test("중도금 아코디언의 접힘과 펼침 동작을 유지한다", async ({ page }) => {
  const toggle = page.getByRole("button", { name: "중도금 납부 상태" });
  const firstPayment = page.getByLabel("1회 중도금");

  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(firstPayment).toBeHidden();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(firstPayment).toBeVisible();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(firstPayment).toBeHidden();
});
