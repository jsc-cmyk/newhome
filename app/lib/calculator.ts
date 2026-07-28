export type ContractMode = "itemized" | "direct";
export type ReservePreset = 0 | 3 | 5 | 10 | "custom";

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

export interface CalculatorInputs {
  contractMode: ContractMode;
  salePrice: number;
  extensionCost: number;
  optionCost: number;
  otherContractCost: number;
  directContractTotal: number;
  paidDeposit: number;
  paidInterim: number;
  interimLoanPrincipal: number;
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
  remainingBalance: number;
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

export const EXAMPLE_INPUTS: CalculatorInputs = {
  contractMode: "itemized",
  salePrice: 367_290_000,
  extensionCost: 0,
  optionCost: 0,
  otherContractCost: 0,
  directContractTotal: 367_290_000,
  paidDeposit: 35_900_000,
  paidInterim: 0,
  interimLoanPrincipal: 0,
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
  salePrice: 0,
  directContractTotal: 0,
  paidDeposit: 0,
  reservePreset: 0,
};

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
  const paidTotal = sum([inputs.paidDeposit, inputs.paidInterim]);
  const remainingBalance = Math.max(contractTotal - paidTotal, 0);

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

  // 중도금 대출 원금은 이미 분양대금 납부에 쓰인 자금이므로 총 필요금액에 다시 더하지 않는다.
  const totalRequired = sum([
    remainingBalance,
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
  if (safeWon(inputs.acquisitionTaxReduction) > acquisitionTaxBefore) {
    warnings.push("취득세 감면액이 감면 전 취득세보다 커서 감면 후 세금을 0원으로 제한했습니다.");
  }
  if (inputs.interimLoanPrincipal > 0) {
    warnings.push("중도금 대출 원금은 참고용이며 총 필요금액에 중복 합산하지 않습니다.");
  }

  return {
    contractTotal,
    paidTotal,
    remainingBalance,
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
      balance: remainingBalance,
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
