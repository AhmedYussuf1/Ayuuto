import cors from "cors";
import express from "express";
import p from "./dbConnection.js";
import admin from "firebase-admin";
import fs from "fs";

//  Load Firebase credentials
const credential = JSON.parse(fs.readFileSync("./src/firebase_cr.json"));

admin.initializeApp({
  credential: admin.credential.cert(credential),
});

const app = express();

//  Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
    ],
  })
);

//  Test route
app.get("/", (req, res) => {
  res.send("API running");
});

//  GET all members (test route)
app.get("/member", async (req, res) => {
  try {
    const result = await p.query('SELECT * FROM public."member"');
    res.json(result.rows);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: err.message });
  }
});

//  CREATE member (FIXED)
app.post("/member", async (req, res) => {
  try {
    const { email, firebase_uid, full_name } = req.body;

    //  Validate input
    if (!email || !firebase_uid || !full_name) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    //  FIX: use "name" column instead of full_name
    const result = await p.query(
      `INSERT INTO public."member" (email, firebase_uid, name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [email, firebase_uid, full_name]
    );

    res.status(201).json({
      message: "Member created successfully",
      member: result.rows[0],
    });
  } catch (err) {
    console.error("Create member error:", err);
    res.status(500).json({ error: err.message });
  }
});

//  Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});