import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const poolConnection = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "your_password",
  database: "app_db",
  port: 3306,
});

export const db = drizzle(poolConnection, { schema, mode: "default" });