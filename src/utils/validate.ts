import { z } from "zod";

export const requestSchema = z.object({
  obj_street: z.string().min(1, "obj_street is required."),
  obj_houseNumber: z.number().min(1, "obj_houseNumber is required."),
  obj_houseNumberSupplement: z
    .string()
    .max(1, "obj_houseNumberSupplement cannot be longer than 1 character.")
    .optional(),
});
