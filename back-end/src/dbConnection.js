import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const p = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: process.env.DB_PASSWORD,
  database: "ayuuto",
});

p.on("error", (err) => {
  console.error("PG Pool error:", err);
});

export default p;