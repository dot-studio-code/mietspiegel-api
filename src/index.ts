import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import {
  convertHouseNumber,
  getDistrictsByZipCode,
  getResidentialStatus,
} from "./utils/lib";
import Database, { Database as DatabaseType } from "better-sqlite3";
import { rentIndexYearSchema, residentialStatusSchema } from "./utils/validate";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

let db: DatabaseType;

try {
  db = new Database("./db/rentIndex.sqlite");
  console.log("Connected to the SQLite database.");
} catch (err) {
  console.error("Error opening database", err);
}

app.get("/:rentIndexYear/residentialStatus", (req: Request, res: Response) => {
  const paramValidationResult = rentIndexYearSchema.safeParse(req.params);

  if (!paramValidationResult.success) {
    return res.status(400).json({ errors: paramValidationResult.error.issues });
  }

  const validationResult = residentialStatusSchema.safeParse(req.query);

  if (!validationResult.success) {
    return res.status(400).json({ errors: validationResult.error.issues });
  }

  const { rentIndexYear } = paramValidationResult.data;
  const {
    obj_houseNumber,
    obj_houseNumberSupplement,
    obj_street,
    obj_zipCode,
  } = validationResult.data;

  try {
    const result = getResidentialStatus({
      obj_houseNumber,
      obj_houseNumberSupplement,
      obj_street,
      obj_zipCode,
      rentIndexYear,
      db,
    });

    if (!result) {
      return res.status(404).json({ error: "No street matched" });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error getting residential status", err);
    return res.status(500).json({ error: "Error getting residential status" });
  }
});

process.on("SIGINT", () => {
  db.close();
  console.log("Closed the database connection.");
  process.exit(0);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
