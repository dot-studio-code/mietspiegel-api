import { zipCodesByDistrict } from "./consts/zipCodes";
import { DBResult, type HouseNumberDetails } from "./types";
import { type Database as DatabaseType } from "better-sqlite3";

export const convertHouseNumber = (
  houseNumber: number,
  houseNumberSupplement?: string
): HouseNumberDetails => {
  const letterPosition: string = houseNumberSupplement
    ? (
        houseNumberSupplement.toLowerCase().charCodeAt(0) -
        "a".charCodeAt(0) +
        1
      )
        .toString()
        .padStart(2, "0")
    : "0";

  const houseNumberDecimal: number = parseFloat(
    `${houseNumber}.${letterPosition}`
  );

  return {
    houseNumberDecimal,
    houseNumberBlock: houseNumber % 2 === 0 ? "G" : "U",
  };
};

export const parseHouseNumberDecimal = (
  houseNumberDecimal: number | null
):
  | {
      houseNumber: number;
      houseNumberSupplement?: string;
    }
  | undefined => {
  if (houseNumberDecimal === null) {
    return undefined;
  }

  const parts = houseNumberDecimal.toString().split(".");
  const houseNumber = parseInt(parts[0], 10);
  let houseNumberSupplement = undefined;

  if (parts.length > 1 && parts[1] !== "00") {
    const letterCode = parseInt(parts[1], 10);
    houseNumberSupplement = String.fromCharCode(96 + letterCode);
  }

  return {
    houseNumber,
    houseNumberSupplement,
  };
};

export const getDistrictsByZipCode = (zipCode: string): string[] => {
  const matchedDistricts: string[] = [];
  for (const { district, zipCodes } of zipCodesByDistrict) {
    if (zipCodes.includes(zipCode)) {
      matchedDistricts.push(district);
    }
  }
  return matchedDistricts;
};

export const getResidentialStatus = ({
  houseNumber,
  houseNumberSupplement,
  street,
  zipCode,
  rentIndexYear,
  db,
}: {
  houseNumber: number;
  houseNumberSupplement?: string;
  street: string;
  zipCode: string;
  rentIndexYear: string;
  db: DatabaseType;
}): DBResult | undefined => {
  const houseNumberDecimal = convertHouseNumber(
    houseNumber,
    houseNumberSupplement as string
  );

  const districtsMap = getDistrictsByZipCode(zipCode);
  const districtsString = districtsMap.map((district) => `'${district}'`);

  const sql = `
  SELECT 
    *, 
    COALESCE("houseNumberRangeEndDecimal" - ${houseNumberDecimal.houseNumberDecimal}, 0) AS "houseNumberRangeDiff" 
  FROM "streetIndex_Berlin_${rentIndexYear}"
  WHERE
    "street" = '${street}' AND 
    "district" IN (${districtsString}) AND 
      (
        (
          "houseNumberRangeStartDecimal" <= ${houseNumberDecimal.houseNumberDecimal} AND
          "houseNumberRangeEndDecimal" >= ${houseNumberDecimal.houseNumberDecimal} AND
          "B" IN ('${houseNumberDecimal.houseNumberBlock}', 'F')
        ) OR
        "B" = 'K'
      )
  GROUP BY 
      "id"
  HAVING 
      "houseNumberRangeDiff" >= 0
  ORDER BY 
      "houseNumberRangeDiff" ASC
  LIMIT 1;`;

  const stmt = db.prepare(sql);
  const result = stmt.get();

  return result as DBResult | undefined;
};

export const convertBooleanString = (value: string): boolean =>
  value === "true";

export const fetchDistinctStreets = (
  db: DatabaseType,
  rentIndexYear: string
): string[] => {
  const sql = `
  SELECT DISTINCT "street" FROM "streetIndex_Berlin_${rentIndexYear}";
  `;

  const stmt = db.prepare(sql);
  const results = stmt.all() as {
    street: string;
  }[];

  return results.map((row) => row.street);
};
