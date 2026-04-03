 import express from "express";
import cors from "cors";
import pool from "./dbConnection.js";
import admin from "firebase-admin";
 
 
  import fs from "fs";

const credential = JSON.parse(fs.readFileSync("./config/firebase_cr.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(credential),
});

const app = express();

app.use(express.json());
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));

app.get("/", (req, res) => {
  res.send("API running");
});

app.get("/member", async (req, res) => {
  try {
    const result = await p.query(`
      SELECT member_id, email, firebase_uid, created_at, full_name
      FROM public.member
      ORDER BY member_id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/member", async (req, res) => {
  const { email, firebase_uid, full_name } = req.body;

  if (!email || !firebase_uid || !full_name) {
    return res.status(400).json({
      error: "email, firebase_uid, and full_name are required",
    });
  }

  try {
    const result = await p.query(
      `
      INSERT INTO public.member (email, firebase_uid, full_name)
      VALUES ($1, $2, $3)
      ON CONFLICT (email)
      DO UPDATE SET
        firebase_uid = EXCLUDED.firebase_uid,
        full_name = EXCLUDED.full_name
      RETURNING member_id, email, firebase_uid, created_at, full_name
      `,
      [email, firebase_uid, full_name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});