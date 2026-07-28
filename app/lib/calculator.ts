import {
  type FloorCategory,
  getApartmentPreset,
  type HousingType,
} from "../data/apartmentPresets.ts";

export type ContractMode = "itemized" | "direct";
export type PriceInputMode = "preset" | "manual";
export type ReservePreset = 0 | 3 | 5 | 10 | "custom";
export type InterimPaymentStatus = "unpaid" | "self" | "loan";

export type EntryCostKey =
  | "managementDeposit"
  | "advanceManagement"
  | "moving"
  | "cleaning"
  | "grout"
  | "elasticCoat"
  | "sickHouse"
  | "curtains"
  | "airConditioner"
  | "appliances"
  | "furniture"
  | "internet"
  | "otherEntry";

export interface OptionalCost {
  enabled: boolean;
  amount: number;
}

export interface InterimPaymentInstallment {
  amount: number;
  status: InterimPaymentStatus;
}

export interface CalculatorInputs {
  priceInputMode: PriceInputMode;
  housingType: HousingType;
  floorCategory: FloorCategory;
  contractMode: ContractMode;
  salePrice: number;
  extensionCost: number;
  optionCost: number;
  otherContractCost: number;
  directContractTotal: number;
  contractFirstPayment: number;
  contractSecondPayment: number;
  scheduledBalance: number;
  paidDeposit: number;
  paidOptionCost: number;
  paidInterim: number;
  interimLoanPrincipal: number;
  interimPayments: InterimPaymentInstallment[];
  deferredInterest: number;
  finalLoan: number;
  acquisitionTaxRateBps: number;
  acquisitionTaxReduction: number;
  educationTaxMode: "rate" | "direct";
  educationTaxRateBps: number;
  educationTaxDirect: number;
  ruralTax: number;
  otherTax: number;
  registrationCosts: Record<string, number>;
  entryCosts: Record<EntryCostKey, OptionalCost>;
  reservePreset: ReservePreset;
  customReserveRateBps: number;
}

export interface CalculationResult {
  contractTotal: number;
  paidTotal: number;
  paidToDeveloperTotal: number;
  remainingBalance: number;
  selfPaidIntermediate: number;
  loanPaidIntermediate: number;
  unpaidIntermediate: number;
  scheduledIntermediateTotal: number;
  scheduledPaymentTotal: number;
  interimLoanRepaymentPrincipal: number;
  acquisitionTaxBefore: number;
  acquisitionTaxReductionApplied: number;
  acquisitionTaxAfter: number;
  educationTax: number;
  acquisitionTaxTotal: number;
  registrationTotal: number;
  entryTotal: number;
  ancillaryTotal: number;
  taxAndAncillaryTotal: number;
  totalRequired: number;
  loanCoverage: number;
  cashNeeded: number;
  surplus: number;
  reserveRateBps: number;
  reserveAmount: number;
  recommendedCash: number;
  warnings: string[];
  chart: {
    balance: number;
    tax: number;
    registration: number;
    movingAndWork: number;
    appliancesAndFurniture: number;
    other: number;
  };
}

const safeWon = (value: number) =>
  Number.isFinite(value)
    ? Math.min(Math.max(Math.round(value), 0), Number.MAX_SAFE_INTEGER)
    : 0;

const sum = (values: number[]) =>
  values.reduce((total, value) => safeWon(total + safeWon(value)), 0);

const percentageOf = (amount: number, rateBps: number) =>
  safeWon((safeWon(amount) * safeWon(rateBps)) / 10_000);

export interface InterimPaymentSummary {
  selfPaid: number;
  loanPaid: number;
  unpaid: number;
  total: number;
}

export function createInterimPayments(
  amount: number,
  count: number,
  status: InterimPaymentStatus = "unpaid",
): InterimPaymentInstallment[] {
  return Array.from({ length: Math.max(Math.trunc(count), 0) }, () => ({
    amount: safeWon(amount),
    status,
  }));
}

export function summarizeInterimPayments(
  payments: InterimPaymentInstallment[],
): InterimPaymentSummary {
  return payments.reduce<InterimPaymentSummary>(
    (summary, payment) => {
      const amount = safeWon(payment.amount);
      summary.total = safeWon(summary.total + amount);
      if (payment.status === "self") {
        summary.selfPaid = safeWon(summary.selfPaid + amount);
      } else if (payment.status === "loan") {
        summary.loanPaid = safeWon(summary.loanPaid + amount);
      } else {
        summary.unpaid = safeWon(summary.unpaid + amount);
      }
      return summary;
    },
    { selfPaid: 0, loanPaid: 0, unpaid: 0, total: 0 },
  );
}

export function withInterimPaymentAggregates(
  inputs: CalculatorInputs,
  interimPayments: InterimPaymentInstallment[],
): CalculatorInputs {
  const summary = summarizeInterimPayments(interimPayments);
  return {
    ...inputs,
    interimPayments,
    paidInterim: summary.selfPaid,
    interimLoanPrincipal: summary.loanPaid,
  };
}

export const ENTRY_COST_LABELS: Record<EntryCostKey, string> = {
  managementDeposit: "관리비예치금",
  advanceManagement: "선수관리비·기타 관리비",
  moving: "이사비",
  cleaning: "입주청소비",
  grout: "줄눈 시공비",
  elasticCoat: "탄성코트 시공비",
  sickHouse: "새집증후군 시공비",
  curtains: "블라인드·커튼",
  airConditioner: "에어컨",
  appliances: "가전제품",
  furniture: "가구",
  internet: "인터넷 설치비",
  otherEntry: "기타 입주비용",
};

export const REGISTRATION_COST_LABELS: Record<string, string> = {
  housingBond: "국민주택채권 할인비용",
  legalFee: "법무사 보수",
  registrationFee: "등기신청 수수료",
  stampTax: "인지세",
  mortgageSetup: "근저당권 설정비용",
  loanGuarantee: "대출 보증료",
  loanHandling: "대출 취급수수료",
  otherRegistration: "기타 등기·대출비용",
};

const examplePreset = getApartmentPreset("59A", "기준층");
const exampleInterimPayments = createInterimPayments(
  examplePreset.intermediatePayment,
  examplePreset.intermediatePaymentCount,
  "loan",
);

export const EXAMPLE_INPUTS: CalculatorInputs = {
  priceInputMode: "preset",
  housingType: "59A",
  floorCategory: "기준층",
  contractMode: "itemized",
  salePrice: examplePreset.salePrice,
  extensionCost: 8_290_000,
  optionCost: 0,
  otherContractCost: 0,
  directContractTotal: 367_290_000,
  contractFirstPayment: examplePreset.contractFirstPayment,
  contractSecondPayment: examplePreset.contractSecondPayment,
  scheduledBalance: examplePreset.balance,
  paidDeposit:
    examplePreset.contractFirstPayment + examplePreset.contractSecondPayment,
  paidOptionCost: 0,
  paidInterim: 0,
  interimLoanPrincipal:
    examplePreset.intermediatePayment * examplePreset.intermediatePaymentCount,
  interimPayments: exampleInterimPayments,
  deferredInterest: 0,
  finalLoan: 0,
  acquisitionTaxRateBps: 0,
  acquisitionTaxReduction: 0,
  educationTaxMode: "rate",
  educationTaxRateBps: 0,
  educationTaxDirect: 0,
  ruralTax: 0,
  otherTax: 0,
  registrationCosts: Object.fromEntries(
    Object.keys(REGISTRATION_COST_LABELS).map((key) => [key, 0]),
  ),
  entryCosts: Object.fromEntries(
    Object.keys(ENTRY_COST_LABELS).map((key) => [
      key,
      { enabled: false, amount: 0 },
    ]),
  ) as Record<EntryCostKey, OptionalCost>,
  reservePreset: 5,
  customReserveRateBps: 500,
};

export const EMPTY_INPUTS: CalculatorInputs = {
  ...EXAMPLE_INPUTS,
  priceInputMode: "manual",
  salePrice: 0,
  extensionCost: 0,
  directContractTotal: 0,
  contractFirstPayment: 0,
  contractSecondPayment: 0,
  scheduledBalance: 0,
  paidDeposit: 0,
  paidOptionCost: 0,
  paidInterim: 0,
  interimLoanPrincipal: 0,
  interimPayments: createInterimPayments(0, 6),
  reservePreset: 0,
};

export function applyApartmentPreset(
  inputs: CalculatorInputs,
  housingType: HousingType,
  floorCategory: FloorCategory,
): CalculatorInputs {
  const preset = getApartmentPreset(housingType, floorCategory);
  const interimPayments = createInterimPayments(
    preset.intermediatePayment,
    preset.intermediatePaymentCount,
    "loan",
  );
  const contractDeposit =
    preset.contractFirstPayment + preset.contractSecondPayment;

  return withInterimPaymentAggregates(
    {
      ...inputs,
      priceInputMode: "preset",
      housingType,
      floorCategory,
      contractMode: "itemized",
      salePrice: preset.salePrice,
      directContractTotal: sum([
        preset.salePrice,
        inputs.extensionCost,
        inputs.optionCost,
        inputs.otherContractCost,
      ]),
      contractFirstPayment: preset.contractFirstPayment,
      contractSecondPayment: preset.contractSecondPayment,
      scheduledBalance: preset.balance,
      paidDeposit: contractDeposit,
    },
    interimPayments,
  );
}

/**
 * 홈페이지의 "예시값 불러오기"에서 사용하는 입력값을 생성한다.
 * 선택한 주택형·층의 공고 데이터와 별도 예시 확장비를 함께 적용하고,
 * 중도금 6회는 전액 대출 납부 상태로 초기화한다.
 */
export function createExampleInputs(
  housingType: HousingType = "59A",
  floorCategory: FloorCategory = "기준층",
): CalculatorInputs {
  return applyApartmentPreset(
    structuredClone(EXAMPLE_INPUTS),
    housingType,
    floorCategory,
  );
}

export function normalizeCalculatorInputs(saved: unknown): CalculatorInputs {
  if (!saved || typeof saved !== "object") {
    return structuredClone(EXAMPLE_INPUTS);
  }

  const source = saved as Partial<CalculatorInputs>;
  const merged: CalculatorInputs = {
    ...structuredClone(EXAMPLE_INPUTS),
    ...source,
    priceInputMode: source.priceInputMode ?? "manual",
    housingType: source.housingType ?? "59A",
    floorCategory: source.floorCategory ?? "기준층",
    registrationCosts: {
      ...EXAMPLE_INPUTS.registrationCosts,
      ...(source.registrationCosts ?? {}),
    },
    entryCosts: {
      ...EXAMPLE_INPUTS.entryCosts,
      ...(source.entryCosts ?? {}),
    },
    interimPayments: [],
  };

  if (Array.isArray(source.interimPayments)) {
    merged.interimPayments = source.interimPayments.map((payment) => ({
      amount: safeWon(payment.amount),
      status:
        payment.status === "self" || payment.status === "loan"
          ? payment.status
          : "unpaid",
    }));
    return withInterimPaymentAggregates(merged, merged.interimPayments);
  }

  const fallbackPayments = createInterimPayments(0, 6);
  let paymentIndex = 0;
  if (safeWon(source.paidInterim ?? 0) > 0) {
    fallbackPayments[paymentIndex++] = {
      amount: safeWon(source.paidInterim ?? 0),
      status: "self",
    };
  }
  if (safeWon(source.interimLoanPrincipal ?? 0) > 0) {
    fallbackPayments[paymentIndex] = {
      amount: safeWon(source.interimLoanPrincipal ?? 0),
      status: "loan",
    };
  }
  return withInterimPaymentAggregates(merged, fallbackPayments);
}

export function calculate(inputs: CalculatorInputs): CalculationResult {
  const contractTotal =
    inputs.contractMode === "direct"
      ? safeWon(inputs.directContractTotal)
      : sum([
          inputs.salePrice,
          inputs.extensionCost,
          inputs.optionCost,
          inputs.otherContractCost,
        ]);
  const interimSummary = summarizeInterimPayments(
    Array.isArray(inputs.interimPayments) ? inputs.interimPayments : [],
  );
  const selfPaidIntermediate =
    inputs.interimPayments.length > 0
      ? interimSummary.selfPaid
      : safeWon(inputs.paidInterim);
  const loanPaidIntermediate =
    inputs.interimPayments.length > 0
      ? interimSummary.loanPaid
      : safeWon(inputs.interimLoanPrincipal);
  const unpaidIntermediate =
    inputs.interimPayments.length > 0 ? interimSummary.unpaid : 0;
  const scheduledIntermediateTotal =
    inputs.interimPayments.length > 0 ? interimSummary.total : 0;
  // 이미 납부한 옵션비도 계약금·본인 납부 중도금과 함께 실제 납부액으로 차감한다.
  const paidTotal = sum([
    inputs.paidDeposit,
    inputs.paidOptionCost,
    selfPaidIntermediate,
  ]);
  const paidToDeveloperTotal = sum([paidTotal, loanPaidIntermediate]);
  const remainingBalance = Math.max(
    contractTotal - paidToDeveloperTotal,
    0,
  );
  const scheduledPaymentTotal = sum([
    inputs.contractFirstPayment,
    inputs.contractSecondPayment,
    scheduledIntermediateTotal,
    inputs.scheduledBalance,
  ]);

  // 세율은 basis point(1% = 100) 정수로 보관해 원 단위 계산의 부동소수점 오차를 피한다.
  const acquisitionTaxBefore = percentageOf(
    contractTotal,
    inputs.acquisitionTaxRateBps,
  );
  const acquisitionTaxReductionApplied = Math.min(
    safeWon(inputs.acquisitionTaxReduction),
    acquisitionTaxBefore,
  );
  const acquisitionTaxAfter = Math.max(
    acquisitionTaxBefore - acquisitionTaxReductionApplied,
    0,
  );
  const educationTax =
    inputs.educationTaxMode === "direct"
      ? safeWon(inputs.educationTaxDirect)
      : percentageOf(contractTotal, inputs.educationTaxRateBps);
  const acquisitionTaxTotal = sum([
    acquisitionTaxAfter,
    educationTax,
    inputs.ruralTax,
    inputs.otherTax,
  ]);

  const registrationTotal = sum(Object.values(inputs.registrationCosts));
  const enabledEntry = Object.entries(inputs.entryCosts)
    .filter(([, item]) => item.enabled)
    .map(([, item]) => item.amount);
  const entryTotal = sum(enabledEntry);
  const ancillaryTotal = sum([registrationTotal, entryTotal]);
  const taxAndAncillaryTotal = sum([acquisitionTaxTotal, ancillaryTotal]);

  // 중도금 대출 원금은 남은 분양대금에서 먼저 제외하고, 상환·전환할 금융채무로 한 번만 더한다.
  const interimLoanRepaymentPrincipal = loanPaidIntermediate;
  const totalRequired = sum([
    remainingBalance,
    interimLoanRepaymentPrincipal,
    inputs.deferredInterest,
    acquisitionTaxTotal,
    ancillaryTotal,
  ]);
  const loanCoverage = safeWon(inputs.finalLoan);
  const cashGap = totalRequired - loanCoverage;
  const cashNeeded = Math.max(cashGap, 0);
  const surplus = Math.max(-cashGap, 0);
  const reserveRateBps =
    inputs.reservePreset === "custom"
      ? safeWon(inputs.customReserveRateBps)
      : inputs.reservePreset * 100;
  const reserveAmount = percentageOf(cashNeeded, reserveRateBps);
  const recommendedCash = sum([cashNeeded, reserveAmount]);

  const entry = inputs.entryCosts;
  const movingAndWork = sum(
    (["moving", "cleaning", "grout", "elasticCoat", "sickHouse"] as EntryCostKey[])
      .filter((key) => entry[key].enabled)
      .map((key) => entry[key].amount),
  );
  const appliancesAndFurniture = sum(
    (["airConditioner", "appliances", "furniture"] as EntryCostKey[])
      .filter((key) => entry[key].enabled)
      .map((key) => entry[key].amount),
  );
  const otherEntry = Math.max(entryTotal - movingAndWork - appliancesAndFurniture, 0);

  const warnings: string[] = [];
  if (paidTotal > contractTotal) {
    warnings.push("현재까지 납부한 금액이 총 계약금액보다 큽니다.");
  }
  if (
    (inputs.priceInputMode === "preset" || inputs.contractMode === "itemized") &&
    safeWon(inputs.paidOptionCost) > safeWon(inputs.optionCost)
  ) {
    warnings.push("현재까지 납부한 옵션비가 입력한 유상 옵션비보다 큽니다.");
  }
  if (safeWon(inputs.acquisitionTaxReduction) > acquisitionTaxBefore) {
    warnings.push("취득세 감면액이 감면 전 취득세보다 커서 감면 후 세금을 0원으로 제한했습니다.");
  }
  if (
    inputs.priceInputMode === "preset" &&
    scheduledPaymentTotal !== safeWon(inputs.salePrice)
  ) {
    warnings.push("계약금·중도금·잔금 납부일정 합계가 분양가격과 다릅니다.");
  }
  return {
    contractTotal,
    paidTotal,
    paidToDeveloperTotal,
    remainingBalance,
    selfPaidIntermediate,
    loanPaidIntermediate,
    unpaidIntermediate,
    scheduledIntermediateTotal,
    scheduledPaymentTotal,
    interimLoanRepaymentPrincipal,
    acquisitionTaxBefore,
    acquisitionTaxReductionApplied,
    acquisitionTaxAfter,
    educationTax,
    acquisitionTaxTotal,
    registrationTotal,
    entryTotal,
    ancillaryTotal,
    taxAndAncillaryTotal,
    totalRequired,
    loanCoverage,
    cashNeeded,
    surplus,
    reserveRateBps,
    reserveAmount,
    recommendedCash,
    warnings,
    chart: {
      balance: sum([remainingBalance, interimLoanRepaymentPrincipal]),
      tax: acquisitionTaxTotal,
      registration: registrationTotal,
      movingAndWork,
      appliancesAndFurniture,
      other: sum([otherEntry, inputs.deferredInterest]),
    },
  };
}

export function formatWon(value: number): string {
  return `${safeWon(value).toLocaleString("ko-KR")}원`;
}

export function formatKoreanWon(value: number): string {
  const won = safeWon(value);
  if (won === 0) return "0원";
  const eok = Math.floor(won / 100_000_000);
  const man = Math.floor((won % 100_000_000) / 10_000);
  const rest = won % 10_000;
  return [
    eok ? `${eok.toLocaleString("ko-KR")}억` : "",
    man ? `${man.toLocaleString("ko-KR")}만` : "",
    rest ? `${rest.toLocaleString("ko-KR")}원` : eok || man ? "원" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
