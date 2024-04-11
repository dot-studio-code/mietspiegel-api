import { z } from "zod";
import { getDistrictsByZipCode } from "./lib";

const objStreetSchema = z.string().min(1, "obj_street is required.");

const objHouseNumberSchema = z
  .string()
  .min(1, "houseNumber must be at least 1 character long")
  .transform((str) => parseInt(str, 10));

const objHouseNumberSupplementSchema = z
  .string()
  .max(1, "obj_houseNumberSupplement cannot be longer than 1 character.")
  .optional();

const objZipCodeSchema = z
  .string()
  .min(5, "obj_zipCode must be at least 5 characters long.")
  .refine((zipCode) => getDistrictsByZipCode(zipCode).length >= 1, {
    message: "obj_zipCode must match at least one district.",
  });

const rentIndexYearSchema = z.enum(["2017", "2019", "2021", "2023"]);

export const residentialStatusSchema = z.object({
  obj_street: objStreetSchema,
  obj_houseNumber: objHouseNumberSchema,
  obj_houseNumberSupplement: objHouseNumberSupplementSchema,
  obj_zipCode: objZipCodeSchema,
  rentIndexYear: rentIndexYearSchema,
});
