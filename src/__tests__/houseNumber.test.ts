import { convertHouseNumber } from "../utils/lib";
import { type HouseNumberDetails } from "../utils/types";

describe("convertHouseNumber", () => {
  // Test for correct decimal conversion
  it("should correctly convert house number and supplement to decimal format", () => {
    const result: HouseNumberDetails = convertHouseNumber(123, "B"); // Assuming 'B' translates to '02'
    expect(result.houseNumberDecimal).toBeCloseTo(123.02);
  });

  // Test for even house number
  it('should assign "G" to even house numbers', () => {
    const result: HouseNumberDetails = convertHouseNumber(124, "A"); // 'A' should be '01'
    expect(result.houseNumberBlock).toEqual("G");
  });

  // Test for odd house number
  it('should assign "U" to odd house numbers', () => {
    const result: HouseNumberDetails = convertHouseNumber(123, "C"); // 'C' should be '03'
    expect(result.houseNumberBlock).toEqual("U");
  });

  // Additional test: check if function handles lowercase letter supplements correctly
  it("should correctly handle lowercase letter supplements", () => {
    const result: HouseNumberDetails = convertHouseNumber(123, "b"); // Lowercase 'b' should also be '02'
    expect(result.houseNumberDecimal).toBeCloseTo(123.02);
  });

  // Additional test: Edge case, no supplement
  it("should handle cases with no house number supplement", () => {
    const result: HouseNumberDetails = convertHouseNumber(123, ""); // No supplement should default to '.00'
    expect(result.houseNumberDecimal).toBeCloseTo(123.0);
  });
});
