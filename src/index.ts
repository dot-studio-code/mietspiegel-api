import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { convertHouseNumber } from "./utils/lib";
import sqlite3 from "sqlite3";
import { requestSchema } from "./utils/validate";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const db = new sqlite3.Database("./db/rentIndex.sqlite", (err) => {
  if (err) {
    console.error("Error opening database", err);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

app.get("/residentialStatus", (req: Request, res: Response) => {
  const validationResult = requestSchema.safeParse(req.query);

  if (!validationResult.success) {
    return res.status(400).json({ errors: validationResult.error.issues });
  }

  const { obj_houseNumber, obj_houseNumberSupplement } = validationResult.data;
  const houseNumberDecimal = convertHouseNumber(
    obj_houseNumber,
    obj_houseNumberSupplement as string
  );

  res.send({});
});

process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Closed the database connection.");
    process.exit(0);
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
