import { type HouseNumberDetails } from "./types";

export const convertHouseNumber = (
  obj_houseNumber: number,
  obj_houseNumberSupplement: string
): HouseNumberDetails => {
  const letterPosition: string = (
    obj_houseNumberSupplement.toLowerCase().charCodeAt(0) -
    "a".charCodeAt(0) +
    1
  )
    .toString()
    .padStart(2, "0");
  const houseNumberDecimal: number = parseFloat(
    `${obj_houseNumber}.${letterPosition}`
  );

  return {
    houseNumberDecimal,
    houseNumberBlock: obj_houseNumber % 2 === 0 ? "G" : "U",
  };
};
