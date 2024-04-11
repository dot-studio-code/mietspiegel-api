import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { convertHouseNumber, getDistrictsByZipCode } from "./utils/lib";
import Database, { Database as DatabaseType } from "better-sqlite3";
import { residentialStatusSchema } from "./utils/validate";

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

app.get("/residentialStatus", (req: Request, res: Response) => {
  const validationResult = residentialStatusSchema.safeParse(req.query);

  if (!validationResult.success) {
    return res.status(400).json({ errors: validationResult.error.issues });
  }

  const {
    obj_houseNumber,
    obj_houseNumberSupplement,
    obj_street,
    obj_zipCode,
    rentIndexYear,
  } = validationResult.data;

  const houseNumberDecimal = convertHouseNumber(
    obj_houseNumber,
    obj_houseNumberSupplement as string
  );

  const districtsMap = getDistrictsByZipCode(obj_zipCode);
  const districtsString = districtsMap.map((district) => `'${district}'`);

  const sql = `
  SELECT 
    *, 
    (houseNumberEndDecimal - ${houseNumberDecimal.houseNumberDecimal}) AS houseNumberDiff 
  FROM streetIndex_Berlin_${rentIndexYear}
  WHERE
    street = '${obj_street}' AND 
    district IN (${districtsString}) AND 
    B IN ('${houseNumberDecimal.houseNumberBlock}', 'F', 'K')
  GROUP BY id HAVING houseNumberDiff >= 0
  ORDER BY houseNumberDiff ASC LIMIT 1`;

  try {
    const stmt = db.prepare(sql);
    const result = stmt.get();
    if (!result) res.status(404).json({ error: "No matching data found" });

    res.send(result).status(200);
  } catch (err) {
    console.error("Database query error", err);
    res.status(500).json({ error: "Internal server error" });
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
