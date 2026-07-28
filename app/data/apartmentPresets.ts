export type HousingType = "59A" | "59B" | "84A" | "84B";

export type FloorCategory =
  | "기준층"
  | "5층"
  | "4층"
  | "3층"
  | "2층"
  | "1층";

export interface ApartmentPricePreset {
  housingType: HousingType;
  floorCategory: FloorCategory;
  landPrice: number;
  buildingPrice: number;
  salePrice: number;
  contractFirstPayment: number;
  contractSecondPayment: number;
  intermediatePayment: number;
  intermediatePaymentCount: number;
  balance: number;
}

export const APARTMENT_PRESET_INFO = {
  complexName: "광주연구개발특구 첨단3지구 첨단 제일풍경채 A2BL",
  announcementDate: "2023-09-15",
} as const;

export const HOUSING_TYPES: readonly HousingType[] = ["59A", "59B", "84A", "84B"];
export const FLOOR_CATEGORIES: readonly FloorCategory[] = [
  "기준층",
  "5층",
  "4층",
  "3층",
  "2층",
  "1층",
];

export const APARTMENT_PRICE_PRESETS: readonly ApartmentPricePreset[] = [
  {
    housingType: "59A",
    floorCategory: "기준층",
    landPrice: 87_477_000,
    buildingPrice: 271_523_000,
    salePrice: 359_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 25_900_000,
    intermediatePayment: 35_900_000,
    intermediatePaymentCount: 6,
    balance: 107_700_000,
  },
  {
    housingType: "59A",
    floorCategory: "5층",
    landPrice: 87_477_000,
    buildingPrice: 267_523_000,
    salePrice: 355_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 25_500_000,
    intermediatePayment: 35_500_000,
    intermediatePaymentCount: 6,
    balance: 106_500_000,
  },
  {
    housingType: "59A",
    floorCategory: "4층",
    landPrice: 87_477_000,
    buildingPrice: 260_523_000,
    salePrice: 348_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 24_800_000,
    intermediatePayment: 34_800_000,
    intermediatePaymentCount: 6,
    balance: 104_400_000,
  },
  {
    housingType: "59A",
    floorCategory: "3층",
    landPrice: 87_477_000,
    buildingPrice: 248_523_000,
    salePrice: 336_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 23_600_000,
    intermediatePayment: 33_600_000,
    intermediatePaymentCount: 6,
    balance: 100_800_000,
  },
  {
    housingType: "59A",
    floorCategory: "2층",
    landPrice: 87_477_000,
    buildingPrice: 228_523_000,
    salePrice: 316_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 21_600_000,
    intermediatePayment: 31_600_000,
    intermediatePaymentCount: 6,
    balance: 94_800_000,
  },
  {
    housingType: "59A",
    floorCategory: "1층",
    landPrice: 87_477_000,
    buildingPrice: 205_523_000,
    salePrice: 293_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 19_300_000,
    intermediatePayment: 29_300_000,
    intermediatePaymentCount: 6,
    balance: 87_900_000,
  },
  {
    housingType: "59B",
    floorCategory: "기준층",
    landPrice: 87_275_000,
    buildingPrice: 268_725_000,
    salePrice: 356_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 25_600_000,
    intermediatePayment: 35_600_000,
    intermediatePaymentCount: 6,
    balance: 106_800_000,
  },
  {
    housingType: "59B",
    floorCategory: "5층",
    landPrice: 87_275_000,
    buildingPrice: 264_725_000,
    salePrice: 352_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 25_200_000,
    intermediatePayment: 35_200_000,
    intermediatePaymentCount: 6,
    balance: 105_600_000,
  },
  {
    housingType: "59B",
    floorCategory: "4층",
    landPrice: 87_275_000,
    buildingPrice: 257_725_000,
    salePrice: 345_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 24_500_000,
    intermediatePayment: 34_500_000,
    intermediatePaymentCount: 6,
    balance: 103_500_000,
  },
  {
    housingType: "59B",
    floorCategory: "3층",
    landPrice: 87_275_000,
    buildingPrice: 245_725_000,
    salePrice: 333_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 23_300_000,
    intermediatePayment: 33_300_000,
    intermediatePaymentCount: 6,
    balance: 99_900_000,
  },
  {
    housingType: "59B",
    floorCategory: "2층",
    landPrice: 87_275_000,
    buildingPrice: 225_725_000,
    salePrice: 313_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 21_300_000,
    intermediatePayment: 31_300_000,
    intermediatePaymentCount: 6,
    balance: 93_900_000,
  },
  {
    housingType: "59B",
    floorCategory: "1층",
    landPrice: 87_275_000,
    buildingPrice: 201_725_000,
    salePrice: 289_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 18_900_000,
    intermediatePayment: 28_900_000,
    intermediatePaymentCount: 6,
    balance: 86_700_000,
  },
  {
    housingType: "84A",
    floorCategory: "기준층",
    landPrice: 124_125_000,
    buildingPrice: 363_875_000,
    salePrice: 488_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 38_800_000,
    intermediatePayment: 48_800_000,
    intermediatePaymentCount: 6,
    balance: 146_400_000,
  },
  {
    housingType: "84A",
    floorCategory: "5층",
    landPrice: 124_125_000,
    buildingPrice: 358_875_000,
    salePrice: 483_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 38_300_000,
    intermediatePayment: 48_300_000,
    intermediatePaymentCount: 6,
    balance: 144_900_000,
  },
  {
    housingType: "84A",
    floorCategory: "4층",
    landPrice: 124_125_000,
    buildingPrice: 348_875_000,
    salePrice: 473_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 37_300_000,
    intermediatePayment: 47_300_000,
    intermediatePaymentCount: 6,
    balance: 141_900_000,
  },
  {
    housingType: "84A",
    floorCategory: "3층",
    landPrice: 124_125_000,
    buildingPrice: 332_875_000,
    salePrice: 457_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 35_700_000,
    intermediatePayment: 45_700_000,
    intermediatePaymentCount: 6,
    balance: 137_100_000,
  },
  {
    housingType: "84A",
    floorCategory: "2층",
    landPrice: 124_125_000,
    buildingPrice: 305_875_000,
    salePrice: 430_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 33_000_000,
    intermediatePayment: 43_000_000,
    intermediatePaymentCount: 6,
    balance: 129_000_000,
  },
  {
    housingType: "84A",
    floorCategory: "1층",
    landPrice: 124_125_000,
    buildingPrice: 274_875_000,
    salePrice: 399_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 29_900_000,
    intermediatePayment: 39_900_000,
    intermediatePaymentCount: 6,
    balance: 119_700_000,
  },
  {
    housingType: "84B",
    floorCategory: "기준층",
    landPrice: 124_134_000,
    buildingPrice: 358_866_000,
    salePrice: 483_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 38_300_000,
    intermediatePayment: 48_300_000,
    intermediatePaymentCount: 6,
    balance: 144_900_000,
  },
  {
    housingType: "84B",
    floorCategory: "5층",
    landPrice: 124_134_000,
    buildingPrice: 353_866_000,
    salePrice: 478_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 37_800_000,
    intermediatePayment: 47_800_000,
    intermediatePaymentCount: 6,
    balance: 143_400_000,
  },
  {
    housingType: "84B",
    floorCategory: "4층",
    landPrice: 124_134_000,
    buildingPrice: 344_866_000,
    salePrice: 469_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 36_900_000,
    intermediatePayment: 46_900_000,
    intermediatePaymentCount: 6,
    balance: 140_700_000,
  },
  {
    housingType: "84B",
    floorCategory: "3층",
    landPrice: 124_134_000,
    buildingPrice: 328_866_000,
    salePrice: 453_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 35_300_000,
    intermediatePayment: 45_300_000,
    intermediatePaymentCount: 6,
    balance: 135_900_000,
  },
  {
    housingType: "84B",
    floorCategory: "2층",
    landPrice: 124_134_000,
    buildingPrice: 301_866_000,
    salePrice: 426_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 32_600_000,
    intermediatePayment: 42_600_000,
    intermediatePaymentCount: 6,
    balance: 127_800_000,
  },
  {
    housingType: "84B",
    floorCategory: "1층",
    landPrice: 124_134_000,
    buildingPrice: 271_866_000,
    salePrice: 396_000_000,
    contractFirstPayment: 10_000_000,
    contractSecondPayment: 29_600_000,
    intermediatePayment: 39_600_000,
    intermediatePaymentCount: 6,
    balance: 118_800_000,
  },
];

export function getApartmentPreset(
  housingType: HousingType,
  floorCategory: FloorCategory,
): ApartmentPricePreset {
  const preset = APARTMENT_PRICE_PRESETS.find(
    (item) =>
      item.housingType === housingType &&
      item.floorCategory === floorCategory,
  );
  if (!preset) {
    throw new Error(`${housingType} ${floorCategory} 분양가격 데이터가 없습니다.`);
  }
  return preset;
}

export function getFloorCategories(
  housingType: HousingType,
): FloorCategory[] {
  return FLOOR_CATEGORIES.filter((floorCategory) =>
    APARTMENT_PRICE_PRESETS.some(
      (item) =>
        item.housingType === housingType &&
        item.floorCategory === floorCategory,
    ),
  );
}

export function getBaselinePriceDifference(
  housingType: HousingType,
  floorCategory: FloorCategory,
): number {
  return (
    getApartmentPreset(housingType, floorCategory).salePrice -
    getApartmentPreset(housingType, "기준층").salePrice
  );
}

export function validateApartmentPricePresets(): string[] {
  const errors: string[] = [];

  for (const preset of APARTMENT_PRICE_PRESETS) {
    const label = `${preset.housingType} ${preset.floorCategory}`;
    if (preset.landPrice + preset.buildingPrice !== preset.salePrice) {
      errors.push(`${label}: 대지비와 건축비 합계가 분양가격과 다릅니다.`);
    }

    const paymentTotal =
      preset.contractFirstPayment +
      preset.contractSecondPayment +
      preset.intermediatePayment * preset.intermediatePaymentCount +
      preset.balance;
    if (paymentTotal !== preset.salePrice) {
      errors.push(`${label}: 계약금·중도금·잔금 합계가 분양가격과 다릅니다.`);
    }
  }

  return errors;
}

if (process.env.NODE_ENV !== "production") {
  const validationErrors = validateApartmentPricePresets();
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join("\n"));
  }
}
