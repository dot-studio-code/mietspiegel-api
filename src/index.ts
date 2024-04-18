import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import {
  convertBooleanString,
  fetchDistinctStreets,
  getResidentialStatus,
  parseHouseNumberDecimal,
} from "./utils/lib";
import Database, { Database as DatabaseType } from "better-sqlite3";
import { rentIndexYearSchema, residentialStatusSchema } from "./utils/validate";
import Fuse from "fuse.js";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

let db: DatabaseType;
let DISTINCT_STREETS: Record<string, string[]>; // Define DISTINCT_STREETS at a higher scope

try {
  db = new Database("./db/rentIndex.sqlite");
  console.log("Connected to the SQLite database.");

  DISTINCT_STREETS = {
    2017: fetchDistinctStreets(db, "2017"),
    2019: fetchDistinctStreets(db, "2019"),
    2023: fetchDistinctStreets(db, "2023"),
  };
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

  const requestData = {
    houseNumber: validationResult.data.obj_houseNumber,
    houseNumberSupplement: validationResult.data.obj_houseNumberSupplement,
    street: validationResult.data.obj_street,
    zipCode: validationResult.data.obj_zipCode,
    rentIndexYear: rentIndexYear,
  };

  const fuse = new Fuse(DISTINCT_STREETS[rentIndexYear]);

  const searchResult = fuse.search(requestData.street);

  try {
    const result = getResidentialStatus({
      ...requestData,
      street: searchResult[0].item,
      db,
    });

    if (!result) {
      return res.status(404).json({
        status: "error",
        message: "no street matched",
        request: requestData,
      });
    }

    const parsedStart = parseHouseNumberDecimal(
      result.houseNumberRangeStartDecimal
    );

    const parsedEnd = parseHouseNumberDecimal(
      result.houseNumberRangeEndDecimal
    );

    const rentIndexBlock = {
      block: result.B,
      ...(parsedStart ? { start: parsedStart } : {}),
      ...(parsedEnd ? { end: parsedEnd } : {}),
    };

    return res.status(200).json({
      status: "success",
      request: requestData,
      data: {
        matchedStreet: result.street,
        district: result.district,
        eastWest: result.eastWest,
        objectStatus: result.objectStatus,
        noiseLevel: convertBooleanString(result.noiseLevel),
        residentialSituation: result.residentialSituation,
        rentIndexBlock,
      },
    });
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
