import { parseHouseNumberDecimal } from "../utils/lib";

describe("parseHouseNumberDecimal", () => {
  it("should return correct house number and supplement", () => {
    const result = parseHouseNumberDecimal(123.02);
    expect(result).toEqual({
      houseNumber: 123,
      houseNumberSupplement: "b",
    });
  });

  it("should return only house number if no valid supplement is present", () => {
    const result = parseHouseNumberDecimal(456.0);
    expect(result).toEqual({
      houseNumber: 456,
    });
  });

  it("should handle house numbers without any decimal part", () => {
    const result = parseHouseNumberDecimal(789);
    expect(result).toEqual({
      houseNumber: 789,
    });
  });

  it("should return correct house number and supplement for high alphabet values", () => {
    const result = parseHouseNumberDecimal(123.26);
    expect(result).toEqual({
      houseNumber: 123,
      houseNumberSupplement: "z",
    });
  });

  it("should handle minimal decimal values properly", () => {
    const result = parseHouseNumberDecimal(456.01);
    expect(result).toEqual({
      houseNumber: 456,
      houseNumberSupplement: "a",
    });
  });

  it("should handle large integers correctly", () => {
    const result = parseHouseNumberDecimal(1000000.18);
    expect(result).toEqual({
      houseNumber: 1000000,
      houseNumberSupplement: "r",
    });
  });

  it("should return undefined for supplement if decimal part is zero", () => {
    const result = parseHouseNumberDecimal(123456.0);
    expect(result.houseNumberSupplement).toBeUndefined();
  });
});
