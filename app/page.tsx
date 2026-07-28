"use client";

import { useEffect, useMemo, useState } from "react";
import { MoneyInput } from "./components/MoneyInput";
import {
  APARTMENT_PRESET_INFO,
  getApartmentPreset,
  getFloorCategories,
  HOUSING_TYPES,
  type FloorCategory,
  type HousingType,
} from "./data/apartmentPresets";
import {
  applyApartmentPreset,
  calculate,
  CalculatorInputs,
  createExampleInputs,
  EMPTY_INPUTS,
  ENTRY_COST_LABELS,
  EntryCostKey,
  EXAMPLE_INPUTS,
  formatKoreanWon,
  formatWon,
  type InterimPaymentStatus,
  normalizeCalculatorInputs,
  REGISTRATION_COST_LABELS,
  ReservePreset,
  withInterimPaymentAggregates,
} from "./lib/calculator";

const STORAGE_KEY = "apartment-move-in-calculator-v1";
const cloneInputs = (source: CalculatorInputs): CalculatorInputs =>
  JSON.parse(JSON.stringify(source)) as CalculatorInputs;

const summaryCards = [
  ["contractTotal", "총 계약금액"],
  ["remainingBalance", "남은 분양대금"],
  ["taxAndAncillaryTotal", "세금 및 부대비용"],
  ["loanCoverage", "잔금대출 예정금액"],
  ["cashNeeded", "현재 입력 기준 준비 현금"],
  ["recommendedCash", "예비비 포함 권장액"],
] as const;

const chartMeta = [
  ["balance", "잔금·중도금대출 상환", "#1d4ed8"],
  ["tax", "세금", "#7c3aed"],
  ["registration", "등기·대출", "#0f766e"],
  ["movingAndWork", "이사·시공", "#ea580c"],
  ["appliancesAndFurniture", "가전·가구", "#be123c"],
  ["other", "기타", "#64748b"],
] as const;

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>(() => cloneInputs(EXAMPLE_INPUTS));
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  const [installmentOpen, setInstallmentOpen] = useState(false);
  const result = useMemo(() => calculate(inputs), [inputs]);
  const selectedPreset = useMemo(
    () => getApartmentPreset(inputs.housingType, inputs.floorCategory),
    [inputs.floorCategory, inputs.housingType],
  );
  const availableFloors = useMemo(
    () => getFloorCategories(inputs.housingType),
    [inputs.housingType],
  );
  const baselineSalePrice = useMemo(
    () => getApartmentPreset(inputs.housingType, "기준층").salePrice,
    [inputs.housingType],
  );
  const priceDifference = selectedPreset.salePrice - baselineSalePrice;
  const inputNotices = [
    inputs.acquisitionTaxRateBps <= 0
      ? "취득세율이 입력되지 않아 취득 관련 세금이 0원으로 계산될 수 있습니다."
      : null,
    result.loanCoverage <= 0
      ? "잔금대출 예정금액이 입력되지 않아 대출 충당금액을 0원으로 계산했습니다."
      : null,
  ].filter((notice): notice is string => notice !== null);
  const canUseFinalLoanRate =
    inputs.priceInputMode === "preset" || inputs.contractMode === "itemized";

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setInputs(normalizeCalculatorInputs(JSON.parse(saved)));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setReady(true);
      }
    });
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs, ready]);

  const set = <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) =>
    setInputs((current) => ({ ...current, [key]: value }));
  const confirmPresetOverwrite = () =>
    !ready ||
    window.confirm(
      "예시 단지를 다시 선택하면 분양가격과 계약금·중도금·잔금 일정의 수정값이 덮어써집니다. 계속할까요?",
    );
  const selectPreset = (
    housingType: HousingType,
    floorCategory: FloorCategory,
  ) => {
    if (!confirmPresetOverwrite()) return;
    setInputs((current) =>
      applyApartmentPreset(current, housingType, floorCategory),
    );
  };
  const updateInterimPayment = (
    index: number,
    patch: Partial<CalculatorInputs["interimPayments"][number]>,
  ) => {
    setInputs((current) => {
      const interimPayments = current.interimPayments.map((payment, paymentIndex) =>
        paymentIndex === index ? { ...payment, ...patch } : payment,
      );
      return withInterimPaymentAggregates(current, interimPayments);
    });
  };
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };
  const resetAll = () => {
    if (
      !window.confirm(
        "입력한 모든 금액과 선택값을 초기화하시겠습니까? 저장된 내용도 삭제됩니다.",
      )
    ) {
      return;
    }
    setInputs(cloneInputs(EMPTY_INPUTS));
    localStorage.removeItem(STORAGE_KEY);
    setInstallmentOpen(false);
    notify("전체 입력값을 초기화했습니다.");
  };

  const rows = [
    ["총 계약금액", result.contractTotal],
    ["현재까지 납부액", result.paidTotal],
    ["현재까지 납부한 옵션비", inputs.paidOptionCost],
    ["시행사 납부액(대출 포함)", result.paidToDeveloperTotal],
    ["남은 분양대금", result.remainingBalance],
    ["중도금 대출 상환 예정 원금", result.interimLoanRepaymentPrincipal],
    ["중도금 대출 후불이자", inputs.deferredInterest],
    ["취득 관련 세금", result.acquisitionTaxTotal],
    ["등기 및 대출비용", result.registrationTotal],
    ["입주 준비비용", result.entryTotal],
    ["총 필요금액", result.totalRequired],
    ["잔금대출 예정금액", result.loanCoverage],
    ["현재 입력 기준 준비 현금", result.cashNeeded],
    ["자금 여유분", result.surplus],
    ["예비비", result.reserveAmount],
    ["권장 준비금액", result.recommendedCash],
  ] as const;

  const copyResult = async () => {
    await navigator.clipboard.writeText(
      ["아파트 입주비용 계산 결과", ...rows.map(([label, value]) => `${label}: ${formatWon(value)}`)].join("\n"),
    );
    notify("계산 결과를 복사했습니다.");
  };
  const downloadCsv = () => {
    const csv = "\uFEFF항목,금액(원)\n" + rows.map(([label, value]) => `"${label}",${value}`).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "아파트-입주비용-계산.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const loadExample = () => {
    if (!confirmPresetOverwrite()) return;
    setInputs(createExampleInputs(inputs.housingType, inputs.floorCategory));
    notify(`${inputs.housingType} ${inputs.floorCategory} 예시값을 불러왔습니다.`);
  };

  const priceDifferenceLabel =
    priceDifference === 0
      ? "기준층과 동일"
      : `${formatWon(Math.abs(priceDifference))} ${
          priceDifference > 0 ? "비쌈" : "저렴"
        }`;

  return (
    <main>
      <header className="hero">
        <div>
          <span className="eyebrow">제일풍경채 입주준비 계산기</span>
          <h1>입주 전에, 필요한 현금을<br />한 번에 계산하세요.</h1>
          <p>분양 잔금부터 세금, 등기, 이사 준비비까지 빠짐없이 모아보는 입주 자금 계획표입니다.</p>
        </div>
        <div className="hero-actions no-print">
          <button className="button ghost" onClick={resetAll}>전체 초기화</button>
          <button className="button light" onClick={loadExample}>예시값 불러오기</button>
        </div>
      </header>

      <section className="summary-grid" aria-label="핵심 계산 결과">
        {summaryCards.map(([key, label], index) => (
          <article key={key} className={`summary-card ${index >= 4 ? "emphasis" : ""}`}>
            <span>{label}</span>
            <strong>{formatWon(result[key])}</strong>
            <small>{formatKoreanWon(result[key])}</small>
          </article>
        ))}
      </section>

      {result.warnings.length > 0 && (
        <aside className="warning" role="alert">
          <strong>입력 내용을 확인해 주세요.</strong>
          {result.warnings.map((warning) => <p key={warning}>• {warning}</p>)}
        </aside>
      )}

      <div className="workspace">
        <section className="form-stack">
          <Details title="분양대금" badge={formatWon(result.contractTotal)} open>
            <div className="mode-switch" role="radiogroup" aria-label="분양가격 입력 방식">
              <label>
                <input
                  type="radio"
                  checked={inputs.priceInputMode === "preset"}
                  onChange={() =>
                    selectPreset(inputs.housingType, inputs.floorCategory)
                  }
                />{" "}
                예시 단지에서 선택
              </label>
              <label>
                <input
                  type="radio"
                  checked={inputs.priceInputMode === "manual"}
                  onChange={() => set("priceInputMode", "manual")}
                />{" "}
                직접 입력
              </label>
            </div>

            {inputs.priceInputMode === "preset" && (
              <div className="preset-panel">
                <div className="select-grid">
                  <label htmlFor="housingType">
                    주택형
                    <select
                      id="housingType"
                      value={inputs.housingType}
                      onChange={(event) => {
                        const housingType = event.target.value as HousingType;
                        const floors = getFloorCategories(housingType);
                        const floorCategory = floors.includes(inputs.floorCategory)
                          ? inputs.floorCategory
                          : (floors[0] ?? "기준층");
                        selectPreset(housingType, floorCategory);
                      }}
                    >
                      {HOUSING_TYPES.map((housingType) => (
                        <option key={housingType} value={housingType}>
                          {housingType}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label htmlFor="floorCategory">
                    층 구분
                    <select
                      id="floorCategory"
                      value={inputs.floorCategory}
                      onChange={(event) =>
                        selectPreset(
                          inputs.housingType,
                          event.target.value as FloorCategory,
                        )
                      }
                    >
                      {availableFloors.map((floorCategory) => (
                        <option key={floorCategory} value={floorCategory}>
                          {floorCategory}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="preset-summary" aria-label="선택한 분양가격과 납부일정">
                  <div>
                    <span>선택</span>
                    <strong>{inputs.housingType} · {inputs.floorCategory}</strong>
                  </div>
                  <div>
                    <span>분양가격</span>
                    <strong>{formatWon(selectedPreset.salePrice)}</strong>
                  </div>
                  <div>
                    <span>{inputs.housingType} 기준층 대비</span>
                    <strong>{priceDifferenceLabel}</strong>
                  </div>
                  <div>
                    <span>계약금</span>
                    <strong>
                      {formatWon(
                        selectedPreset.contractFirstPayment +
                          selectedPreset.contractSecondPayment,
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>중도금 총액</span>
                    <strong>
                      {formatWon(
                        selectedPreset.intermediatePayment *
                          selectedPreset.intermediatePaymentCount,
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>잔금</span>
                    <strong>{formatWon(selectedPreset.balance)}</strong>
                  </div>
                </div>

                <p className="preset-notice">
                  예시 분양가격은 2023년 9월 15일 공고된{" "}
                  {APARTMENT_PRESET_INFO.complexName} 입주자모집공고를 기준으로
                  입력되었습니다. 실제 계약금액은 공급계약서, 발코니
                  확장계약서 및 유상옵션 계약서를 기준으로 확인하시기
                  바랍니다.
                </p>
              </div>
            )}

            {inputs.priceInputMode === "manual" && (
              <>
                <div className="mode-switch compact" role="radiogroup" aria-label="계약금액 직접 입력 방식">
                  <label><input type="radio" checked={inputs.contractMode === "itemized"} onChange={() => set("contractMode", "itemized")} /> 항목별 입력</label>
                  <label><input type="radio" checked={inputs.contractMode === "direct"} onChange={() => set("contractMode", "direct")} /> 총액 직접 입력</label>
                </div>
                <p className="section-help">두 방식 중 선택한 한 가지만 계산에 사용되어 중복 합산되지 않습니다.</p>
              </>
            )}

            {inputs.priceInputMode === "preset" || inputs.contractMode === "itemized" ? (
              <div className="field-grid">
                <MoneyInput id="salePrice" label="분양가" value={inputs.salePrice} onChange={(v) => set("salePrice", v)} />
                <MoneyInput id="extensionCost" label="발코니 확장비" value={inputs.extensionCost} onChange={(v) => set("extensionCost", v)} />
                <MoneyInput id="optionCost" label="유상 옵션비" value={inputs.optionCost} onChange={(v) => set("optionCost", v)} />
                <MoneyInput id="otherContractCost" label="기타 계약금액" value={inputs.otherContractCost} onChange={(v) => set("otherContractCost", v)} />
              </div>
            ) : <MoneyInput id="directContractTotal" label="총 계약금액" value={inputs.directContractTotal} onChange={(v) => set("directContractTotal", v)} />}

            <div className="field-grid divided">
              <MoneyInput id="contractFirstPayment" label="계약금 1차" value={inputs.contractFirstPayment} onChange={(v) => set("contractFirstPayment", v)} />
              <MoneyInput id="contractSecondPayment" label="계약금 2차" value={inputs.contractSecondPayment} onChange={(v) => set("contractSecondPayment", v)} />
              <MoneyInput id="paidDeposit" label="현재까지 납부한 계약금" value={inputs.paidDeposit} onChange={(v) => set("paidDeposit", v)} />
              <MoneyInput id="paidOptionCost" label="현재까지 납부한 옵션비" value={inputs.paidOptionCost} onChange={(v) => set("paidOptionCost", v)} />
            </div>

            <div className="installment-section">
              <button
                type="button"
                className="installment-toggle"
                aria-expanded={installmentOpen}
                aria-controls="interim-payment-panel"
                onClick={() => setInstallmentOpen((open) => !open)}
              >
                <h3>중도금 납부 상태</h3>
                <svg
                  className="installment-arrow"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div
                id="interim-payment-panel"
                className={`installment-accordion-panel ${installmentOpen ? "open" : ""}`}
                aria-hidden={!installmentOpen}
                inert={!installmentOpen}
              >
                <div className="installment-accordion-inner">
                  <div className="installment-accordion-content">
                    <p className="installment-help">
                      각 회차의 금액과 납부 방식을 선택하세요.
                    </p>
                    <div className="installment-list">
                      {inputs.interimPayments.map((payment, index) => (
                        <div className="installment-row" key={index}>
                          <span className="installment-number">{index + 1}회</span>
                          <MoneyInput
                            id={`interim-payment-${index}`}
                            label={`${index + 1}회 중도금`}
                            value={payment.amount}
                            onChange={(amount) =>
                              updateInterimPayment(index, { amount })
                            }
                          />
                          <label htmlFor={`interim-status-${index}`}>
                            납부 상태
                            <select
                              id={`interim-status-${index}`}
                              value={payment.status}
                              onChange={(event) =>
                                updateInterimPayment(index, {
                                  status: event.target.value as InterimPaymentStatus,
                                })
                              }
                            >
                              <option value="unpaid">미납</option>
                              <option value="self">본인 자금 납부</option>
                              <option value="loan">중도금 대출 납부</option>
                            </select>
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="mini-results installment-totals">
                      <ResultLine label="계약금 총액" value={inputs.contractFirstPayment + inputs.contractSecondPayment} />
                      <ResultLine label="본인 자금 납부 중도금" value={result.selfPaidIntermediate} />
                      <ResultLine label="중도금 대출 납부액" value={result.loanPaidIntermediate} />
                      <ResultLine label="미납 중도금" value={result.unpaidIntermediate} />
                      <ResultLine
                        label={inputs.priceInputMode === "manual" ? "자동 계산 잔금" : "공고문 잔금"}
                        value={result.scheduledBalanceAmount}
                      />
                      <ResultLine label="납부일정 합계" value={result.scheduledPaymentTotal} strong />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Details>

          <Details title="대출" badge={formatWon(result.loanCoverage)} open>
            <div className="mini-results loan-summary">
              <ResultLine label="중도금 대출로 납부한 금액" value={result.loanPaidIntermediate} />
              <ResultLine label="중도금 대출 상환 예정 원금" value={result.interimLoanRepaymentPrincipal} strong />
            </div>
            <p className="section-help">중도금 대출 원금은 시행사에 납부된 분양대금에서 제외하고, 입주 시 상환하거나 잔금대출로 전환할 금액으로 한 번만 반영합니다.</p>
            <div className="mode-switch compact loan-input-mode" role="radiogroup" aria-label="잔금대출 입력 방식">
              <label>
                <input
                  type="radio"
                  checked={inputs.finalLoanInputMode === "amount" || !canUseFinalLoanRate}
                  onChange={() => set("finalLoanInputMode", "amount")}
                />{" "}
                금액 직접 입력
              </label>
              <label className={!canUseFinalLoanRate ? "disabled" : ""}>
                <input
                  type="radio"
                  checked={inputs.finalLoanInputMode === "rate" && canUseFinalLoanRate}
                  disabled={!canUseFinalLoanRate}
                  onChange={() => set("finalLoanInputMode", "rate")}
                />{" "}
                분양가+확장비 비율
              </label>
            </div>
            {!canUseFinalLoanRate && (
              <p className="field-hint loan-rate-hint">
                비율 입력은 분양가와 발코니 확장비를 입력하는 항목별 입력 방식에서 사용할 수 있습니다.
              </p>
            )}
            <div className="field-grid">
              <MoneyInput id="deferredInterest" label="중도금 대출 후불이자" value={inputs.deferredInterest} onChange={(v) => set("deferredInterest", v)} />
              {inputs.finalLoanInputMode === "rate" && canUseFinalLoanRate ? (
                <RateInput id="finalLoanRate" label="잔금대출 비율" value={inputs.finalLoanRateBps} onChange={(v) => set("finalLoanRateBps", v)} />
              ) : (
                <MoneyInput id="finalLoan" label="잔금대출 예정금액" value={inputs.finalLoan} onChange={(v) => set("finalLoan", v)} />
              )}
            </div>
            {inputs.finalLoanInputMode === "rate" && canUseFinalLoanRate && (
              <div className="mini-results loan-rate-summary">
                <ResultLine label="비율 계산 기준금액" value={result.finalLoanBaseAmount} />
                <ResultLine label="자동 계산 잔금대출" value={result.loanCoverage} strong />
              </div>
            )}
          </Details>

          <Details title="취득 관련 세금" badge={formatWon(result.acquisitionTaxTotal)}>
            <p className="section-help">세율과 감면기준은 취득 시점·주택 조건에 따라 달라지므로 직접 확인해 입력하세요.</p>
            <div className="field-grid">
              <RateInput id="acquisitionRate" label="취득세율" value={inputs.acquisitionTaxRateBps} onChange={(v) => set("acquisitionTaxRateBps", v)} />
              <MoneyInput id="taxReduction" label="취득세 감면금액" value={inputs.acquisitionTaxReduction} onChange={(v) => set("acquisitionTaxReduction", v)} />
            </div>
            <div className="mode-switch compact">
              <label><input type="radio" checked={inputs.educationTaxMode === "rate"} onChange={() => set("educationTaxMode", "rate")} /> 지방교육세율</label>
              <label><input type="radio" checked={inputs.educationTaxMode === "direct"} onChange={() => set("educationTaxMode", "direct")} /> 금액 직접 입력</label>
            </div>
            <div className="field-grid">
              {inputs.educationTaxMode === "rate"
                ? <RateInput id="educationRate" label="지방교육세율" value={inputs.educationTaxRateBps} onChange={(v) => set("educationTaxRateBps", v)} />
                : <MoneyInput id="educationDirect" label="지방교육세" value={inputs.educationTaxDirect} onChange={(v) => set("educationTaxDirect", v)} />}
              <MoneyInput id="ruralTax" label="농어촌특별세" value={inputs.ruralTax} onChange={(v) => set("ruralTax", v)} />
              <MoneyInput id="otherTax" label="기타 세금" value={inputs.otherTax} onChange={(v) => set("otherTax", v)} />
            </div>
            <div className="mini-results">
              <ResultLine label="감면 전 취득세" value={result.acquisitionTaxBefore} />
              <ResultLine label="취득세 감면액" value={result.acquisitionTaxReductionApplied} />
              <ResultLine label="감면 후 취득세" value={result.acquisitionTaxAfter} />
              <ResultLine label="지방교육세" value={result.educationTax} />
              <ResultLine label="농어촌특별세" value={inputs.ruralTax} />
              <ResultLine label="취득 관련 세금 합계" value={result.acquisitionTaxTotal} strong />
            </div>
          </Details>

          <Details title="등기 및 대출비용" badge={formatWon(result.registrationTotal)}>
            <div className="field-grid">
              {Object.entries(REGISTRATION_COST_LABELS).map(([key, label]) => (
                <MoneyInput key={key} id={key} label={label} value={inputs.registrationCosts[key]} onChange={(value) => setInputs((current) => ({ ...current, registrationCosts: { ...current.registrationCosts, [key]: value } }))} />
              ))}
            </div>
          </Details>

          <Details title="입주 준비비용" badge={formatWon(result.entryTotal)}>
            <p className="section-help">사용할 항목만 체크하면 합계에 포함됩니다.</p>
            <div className="optional-grid">
              {(Object.entries(ENTRY_COST_LABELS) as [EntryCostKey, string][]).map(([key, label]) => {
                const item = inputs.entryCosts[key];
                return (
                  <div className={`optional-item ${item.enabled ? "selected" : ""}`} key={key}>
                    <label className="check-label"><input type="checkbox" checked={item.enabled} onChange={(e) => setInputs((current) => ({ ...current, entryCosts: { ...current.entryCosts, [key]: { ...item, enabled: e.target.checked } } }))} /> {label}</label>
                    <MoneyInput id={`entry-${key}`} label={`${label} 금액`} value={item.amount} disabled={!item.enabled} onChange={(amount) => setInputs((current) => ({ ...current, entryCosts: { ...current.entryCosts, [key]: { ...item, amount } } }))} />
                  </div>
                );
              })}
            </div>
          </Details>
        </section>

        <aside className="result-panel">
          <div className="sticky-card">
            <span className="eyebrow dark">FINAL PLAN</span>
            <h2>최종 계산 결과</h2>
            <div className="cash-hero">
              <span>현재 입력 기준 준비 현금</span>
              <strong>{formatWon(result.cashNeeded)}</strong>
              <small>{formatKoreanWon(result.cashNeeded)}</small>
            </div>
            {inputNotices.length > 0 && (
              <div className="result-guidance" role="note" aria-label="미입력 항목 안내">
                <strong>계산 전 확인해 주세요.</strong>
                {inputNotices.map((notice) => <p key={notice}>• {notice}</p>)}
              </div>
            )}
            {result.surplus > 0 && <div className="surplus">대출·자금 여유분 <strong>{formatWon(result.surplus)}</strong></div>}
            <div className="chart" aria-label="전체 필요금액 구성 막대그래프">
              <div className="chart-bar">
                {chartMeta.map(([key, , color]) => result.totalRequired > 0 && result.chart[key] > 0 && (
                  <span key={key} style={{ width: `${(result.chart[key] / result.totalRequired) * 100}%`, background: color }} />
                ))}
              </div>
              <div className="legend">
                {chartMeta.map(([key, label, color]) => (
                  <div key={key}><i style={{ background: color }} /><span>{label}</span><strong>{formatWon(result.chart[key])}</strong></div>
                ))}
              </div>
            </div>
            <div className="reserve">
              <label htmlFor="reserve">예비비 비율</label>
              <select id="reserve" value={String(inputs.reservePreset)} onChange={(e) => set("reservePreset", e.target.value === "custom" ? "custom" : Number(e.target.value) as ReservePreset)}>
                <option value="0">0%</option><option value="3">3%</option><option value="5">5%</option><option value="10">10%</option><option value="custom">직접 입력</option>
              </select>
              {inputs.reservePreset === "custom" && <RateInput id="customReserve" label="직접 입력 예비비율" value={inputs.customReserveRateBps} onChange={(v) => set("customReserveRateBps", v)} />}
            </div>
            <div className="result-lines">
              <ResultLine label="남은 분양대금" value={result.remainingBalance} />
              <ResultLine label="중도금 대출 상환 예정 원금" value={result.interimLoanRepaymentPrincipal} />
              <ResultLine label="총 필요금액" value={result.totalRequired} />
              <ResultLine label="대출 충당금액" value={result.loanCoverage} />
              <ResultLine label="예비비" value={result.reserveAmount} />
              <ResultLine label="권장 준비금액" value={result.recommendedCash} strong />
            </div>
            <div className="result-actions no-print">
              <button onClick={copyResult}>결과 복사</button>
              <button onClick={downloadCsv}>CSV 저장</button>
              <button onClick={() => window.print()}>인쇄</button>
            </div>
          </div>
        </aside>
      </div>

      <footer>
        <strong>꼭 확인해 주세요</strong>
        <p>본 계산 결과는 자금계획을 위한 참고용이며, 실제 취득세, 감면 적용 여부, 국민주택채권 할인비용, 등기비용 및 대출비용은 계약 조건, 주택 면적, 취득 시점, 지역, 금융기관 및 법무사에 따라 달라질 수 있습니다. 실제 납부 전 관할 지방자치단체, 금융기관 또는 법무사에게 확인하시기 바랍니다.</p>
      </footer>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

function Details({ title, badge, open = false, children }: { title: string; badge: string; open?: boolean; children: React.ReactNode }) {
  return <details className="section-card" open={open}><summary><span>{title}</span><b>{badge}</b></summary><div className="section-content">{children}</div></details>;
}

function RateInput({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (value: number) => void }) {
  return <div className="field"><label htmlFor={id}>{label}</label><div className="money-wrap"><input id={id} inputMode="decimal" value={value ? (value / 100).toString() : ""} placeholder="0" onChange={(e) => onChange(Math.max(Math.round((Number(e.target.value.replace(/[^\d.]/g, "")) || 0) * 100), 0))} /><span>%</span></div><small>소수점 둘째 자리까지 입력 가능</small></div>;
}

function ResultLine({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return <div className={strong ? "strong" : ""}><span>{label}</span><b>{formatWon(value)}</b></div>;
}
