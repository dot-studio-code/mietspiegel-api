import { z } from "zod";
import { getDistrictsByZipCode } from "./lib";

const objStreetSchema = z.string().min(1, "street is required.");

const objHouseNumberSchema = z
  .string()
  .min(1, "houseNumber must be at least 1 character long")
  .transform((str) => parseInt(str, 10));

const objHouseNumberSupplementSchema = z
  .string()
  .max(1, "houseNumberSupplement cannot be longer than 1 character.")
  .optional();

const objZipCodeSchema = z
  .string()
  .min(5, "zipCode must be at least 5 characters long.")
  .refine((zipCode) => getDistrictsByZipCode(zipCode).length >= 1, {
    message: "zipCode must match at least one district.",
  });

export const rentIndexYearSchema = z.object({
  rentIndexYear: z.enum(["2017", "2019", "2021", "2023", "2024"]),
});

export const residentialStatusSchema = z.object({
  street: objStreetSchema,
  houseNumber: objHouseNumberSchema,
  houseNumberSupplement: objHouseNumberSupplementSchema,
  zipCode: objZipCodeSchema,
});
