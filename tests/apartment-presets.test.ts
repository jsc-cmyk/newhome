import assert from "node:assert/strict";
import test from "node:test";
import {
  APARTMENT_PRICE_PRESETS,
  FLOOR_CATEGORIES,
  getApartmentPreset,
  getBaselinePriceDifference,
  getFloorCategories,
  HOUSING_TYPES,
  validateApartmentPricePresets,
} from "../app/data/apartmentPresets.ts";
import {
  applyApartmentPreset,
  calculate,
  createInterimPayments,
  createExampleInputs,
  EXAMPLE_INPUTS,
  normalizeCalculatorInputs,
  type CalculatorInputs,
  withInterimPaymentAggregates,
} from "../app/lib/calculator.ts";

const copy = (source: CalculatorInputs): CalculatorInputs =>
  JSON.parse(JSON.stringify(source)) as CalculatorInputs;

test("모든 주택형·층에서 대지비와 건축비 합계가 분양가격과 일치한다", () => {
  for (const preset of APARTMENT_PRICE_PRESETS) {
    assert.equal(
      preset.landPrice + preset.buildingPrice,
      preset.salePrice,
      `${preset.housingType} ${preset.floorCategory}`,
    );
  }
});

test("모든 데이터의 계약금·중도금·잔금 합계가 분양가격과 일치한다", () => {
  assert.deepEqual(validateApartmentPricePresets(), []);
  for (const preset of APARTMENT_PRICE_PRESETS) {
    const total =
      preset.contractFirstPayment +
      preset.contractSecondPayment +
      preset.intermediatePayment * preset.intermediatePaymentCount +
      preset.balance;
    assert.equal(total, preset.salePrice);
  }
});

test("59A 기준층 분양가격은 359,000,000원이다", () => {
  assert.equal(getApartmentPreset("59A", "기준층").salePrice, 359_000_000);
});

test("59A 기준층에 확장비를 더한 총 계약금액은 367,290,000원이다", () => {
  const result = calculate(copy(EXAMPLE_INPUTS));
  assert.equal(result.contractTotal, 367_290_000);
});

test("예시값 불러오기는 선택한 주택형과 층의 공고 데이터를 적용한다", () => {
  const example = createExampleInputs("84B", "1층");

  assert.equal(example.priceInputMode, "preset");
  assert.equal(example.salePrice, 396_000_000);
  assert.equal(example.extensionCost, 8_290_000);
  assert.equal(example.paidDeposit, 39_600_000);
  assert.equal(example.scheduledBalance, 118_800_000);
  assert.equal(example.interimPayments.length, 6);
  assert.ok(
    example.interimPayments.every(
      (payment) => payment.amount === 39_600_000 && payment.status === "loan",
    ),
  );
  assert.equal(calculate(example).contractTotal, 404_290_000);
});

test("59A 4층은 기준층보다 11,000,000원 저렴하다", () => {
  assert.equal(getBaselinePriceDifference("59A", "4층"), -11_000_000);
});

test("84A 기준층 분양가격은 488,000,000원이다", () => {
  assert.equal(getApartmentPreset("84A", "기준층").salePrice, 488_000_000);
});

test("84B 1층 분양가격은 396,000,000원이다", () => {
  assert.equal(getApartmentPreset("84B", "1층").salePrice, 396_000_000);
});

test("직접 입력 방식에서도 기존 계산식을 사용한다", () => {
  let input = copy(EXAMPLE_INPUTS);
  input.priceInputMode = "manual";
  input.contractMode = "direct";
  input.directContractTotal = 100_000_000;
  input.paidDeposit = 10_000_000;
  input = withInterimPaymentAggregates(
    input,
    createInterimPayments(0, 6, "unpaid"),
  );

  const result = calculate(input);
  assert.equal(result.contractTotal, 100_000_000);
  assert.equal(result.remainingBalance, 90_000_000);
  assert.equal(result.cashNeeded, 90_000_000);
});

test("모든 주택형에서 공고문의 층 구분이 정상적으로 제공된다", () => {
  for (const housingType of HOUSING_TYPES) {
    assert.deepEqual(getFloorCategories(housingType), FLOOR_CATEGORIES);
  }
});

test("저장 후 복원하면 주택형과 층 선택 및 납부 상태가 유지된다", () => {
  const selected = applyApartmentPreset(
    copy(EXAMPLE_INPUTS),
    "84B",
    "1층",
  );
  selected.interimPayments[0].status = "self";
  const restored = normalizeCalculatorInputs(
    JSON.parse(JSON.stringify(selected)),
  );

  assert.equal(restored.priceInputMode, "preset");
  assert.equal(restored.housingType, "84B");
  assert.equal(restored.floorCategory, "1층");
  assert.equal(restored.salePrice, 396_000_000);
  assert.equal(restored.interimPayments[0].status, "self");
});

test("중도금 대출은 남은 분양대금과 상환 예정 원금에 중복 반영되지 않는다", () => {
  const result = calculate(copy(EXAMPLE_INPUTS));
  assert.equal(result.loanPaidIntermediate, 215_400_000);
  assert.equal(result.remainingBalance, 115_990_000);
  assert.equal(result.interimLoanRepaymentPrincipal, 215_400_000);
  assert.equal(
    result.remainingBalance + result.interimLoanRepaymentPrincipal,
    331_390_000,
  );
});
