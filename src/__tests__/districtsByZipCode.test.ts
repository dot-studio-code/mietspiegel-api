import { getDistrictsByZipCode } from "../utils/lib";

describe("getDistrictByZipCode", () => {
  it("should return an array with the correct district for a given zip code", () => {
    expect(getDistrictsByZipCode(10115)).toEqual(["Mitt"]);
  });

  it("should return an array of matched zip codes if a zip code belongs to multiple districts", () => {
    // Assuming 10179 is present in both 'Mitt' and 'FrKr' but 'Mitt' comes first
    expect(getDistrictsByZipCode(10179)).toEqual(["Mitt", "FrKr"]);
  });

  it("should return [] for a zip code that does not belong to any district", () => {
    // Use a zip code that doesn't exist in any districts
    expect(getDistrictsByZipCode(99999)).toEqual([]);
  });
});
