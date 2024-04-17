export interface HouseNumberDetails {
  houseNumberDecimal: number;
  houseNumberBlock: string;
}

export type DBResult = {
  id: number;
  street: string;
  district: string;
  eastWest: string;
  houseNumberStart: number;
  houseNumberStartSupplement: string;
  houseNumberRangeStartDecimal: number;
  houseNumberEnd: number;
  houseNumberEndSupplement: string;
  houseNumberRangeEndDecimal: number;
  B: string;
  objectStatus: 0 | 1 | 2;
  noiseLevel: "true" | "false";
  residentialSituation: "D" | "Z";
  houseNumberRangeDiff: number;
};
