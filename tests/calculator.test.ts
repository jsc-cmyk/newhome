import assert from "node:assert/strict";
import test from "node:test";
import {
  calculate,
  EMPTY_INPUTS,
  EXAMPLE_INPUTS,
  type CalculatorInputs,
} from "../app/lib/calculator.ts";

const copy = (source: CalculatorInputs): CalculatorInputs =>
  JSON.parse(JSON.stringify(source)) as CalculatorInputs;

test("기본 예시값을 계산한다", () => {
  const result = calculate(copy(EXAMPLE_INPUTS));
  assert.equal(result.contractTotal, 367_290_000);
  assert.equal(result.paidTotal, 35_900_000);
  assert.equal(result.remainingBalance, 331_390_000);
  assert.equal(result.cashNeeded, 331_390_000);
  assert.equal(result.reserveAmount, 16_569_500);
  assert.equal(result.recommendedCash, 347_959_500);
});

test("감면액이 취득세보다 크면 취득세를 0원으로 제한한다", () => {
  const input = copy(EXAMPLE_INPUTS);
  input.acquisitionTaxRateBps = 100;
  input.acquisitionTaxReduction = 9_000_000;
  const result = calculate(input);
  assert.equal(result.acquisitionTaxBefore, 3_672_900);
  assert.equal(result.acquisitionTaxAfter, 0);
  assert.match(result.warnings.join(" "), /0원으로 제한/);
});

test("대출이 총 필요금액보다 크면 현금은 0원이고 여유분을 표시한다", () => {
  const input = copy(EXAMPLE_INPUTS);
  input.finalLoan = 400_000_000;
  const result = calculate(input);
  assert.equal(result.cashNeeded, 0);
  assert.equal(result.surplus, 68_610_000);
});

test("모든 부대비용이 0원이어도 정상 계산한다", () => {
  const result = calculate(copy(EXAMPLE_INPUTS));
  assert.equal(result.acquisitionTaxTotal, 0);
  assert.equal(result.registrationTotal, 0);
  assert.equal(result.entryTotal, 0);
  assert.equal(result.ancillaryTotal, 0);
});

test("납부액이 계약금액보다 크면 잔금은 0원이고 경고한다", () => {
  const input = copy(EXAMPLE_INPUTS);
  input.paidDeposit = 500_000_000;
  const result = calculate(input);
  assert.equal(result.remainingBalance, 0);
  assert.match(result.warnings.join(" "), /총 계약금액보다 큽니다/);
});

test("빈 입력값은 모두 0원으로 처리한다", () => {
  const result = calculate(copy(EMPTY_INPUTS));
  assert.equal(result.contractTotal, 0);
  assert.equal(result.totalRequired, 0);
  assert.equal(result.recommendedCash, 0);
});

test("매우 큰 금액도 안전한 정수 범위에서 계산한다", () => {
  const input = copy(EMPTY_INPUTS);
  input.contractMode = "direct";
  input.directContractTotal = Number.MAX_SAFE_INTEGER;
  input.acquisitionTaxRateBps = 100;
  const result = calculate(input);
  assert.equal(result.contractTotal, Number.MAX_SAFE_INTEGER);
  assert.ok(Number.isSafeInteger(result.totalRequired));
  assert.ok(result.totalRequired <= Number.MAX_SAFE_INTEGER);
});

test("저장된 입력 JSON을 복원해 같은 결과를 계산한다", () => {
  const saved = JSON.stringify(EXAMPLE_INPUTS);
  const restored = JSON.parse(saved) as CalculatorInputs;
  assert.deepEqual(calculate(restored), calculate(EXAMPLE_INPUTS));
});
