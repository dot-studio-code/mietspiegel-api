import { z } from "zod";
import { getDistrictsByZipCode } from "./lib";

export const requestSchema = z.object({
  obj_street: z.string().min(1, "obj_street is required."),
  obj_houseNumber: z
    .string()
    .min(1, "houseNumber must be at least 1 character long")
    .transform((str) => parseInt(str, 10)),
  obj_houseNumberSupplement: z
    .string()
    .max(1, "obj_houseNumberSupplement cannot be longer than 1 character.")
    .optional(),
  obj_zipCode: z
    .string()
    .min(5, "obj_zipCode must be at least 5 characters long.")
    .refine((zipCode) => getDistrictsByZipCode(zipCode).length >= 1, {
      message: "obj_zipCode must match at least one district.",
    }),
});
