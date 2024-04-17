import { zipCodesByDistrict } from "./consts/zipCodes";
import { DBResult, type HouseNumberDetails } from "./types";
import { type Database as DatabaseType } from "better-sqlite3";

export const convertHouseNumber = (
  obj_houseNumber: number,
  obj_houseNumberSupplement?: string
): HouseNumberDetails => {
  const letterPosition: string = obj_houseNumberSupplement
    ? (
        obj_houseNumberSupplement.toLowerCase().charCodeAt(0) -
        "a".charCodeAt(0) +
        1
      )
        .toString()
        .padStart(2, "0")
    : "0";

  const houseNumberDecimal: number = parseFloat(
    `${obj_houseNumber}.${letterPosition}`
  );

  return {
    houseNumberDecimal,
    houseNumberBlock: obj_houseNumber % 2 === 0 ? "G" : "U",
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
  obj_houseNumber,
  obj_houseNumberSupplement,
  obj_street,
  obj_zipCode,
  rentIndexYear,
  db,
}: {
  obj_houseNumber: number;
  obj_houseNumberSupplement?: string;
  obj_street: string;
  obj_zipCode: string;
  rentIndexYear: string;
  db: DatabaseType;
}): DBResult | undefined => {
  const houseNumberDecimal = convertHouseNumber(
    obj_houseNumber,
    obj_houseNumberSupplement as string
  );

  const districtsMap = getDistrictsByZipCode(obj_zipCode);
  const districtsString = districtsMap.map((district) => `'${district}'`);

  const sql = `
  SELECT 
    *, 
    COALESCE("houseNumberRangeEndDecimal" - ${houseNumberDecimal.houseNumberDecimal}, 0) AS "houseNumberRangeDiff" 
  FROM "streetIndex_Berlin_${rentIndexYear}"
  WHERE
    "street" = '${obj_street}' AND 
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
