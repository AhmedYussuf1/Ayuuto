 import express from "express";
import cors from "cors";
import pool from "./dbConnection.js";
import admin from "firebase-admin";
import fs from "fs";
import verifyFirebaseToken from "./middleware/verifyFirebaseToken.js";

// Read Firebase service account credentials from local JSON file
const credential = JSON.parse(
  fs.readFileSync("./config/firebase_cr.json", "utf8")
);

// Initialize Firebase Admin SDK so the backend can verify Firebase tokens
admin.initializeApp({
  credential: admin.credential.cert(credential),
});

const app = express();

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Allow requests from your frontend apps
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));

// Helper function to extract token from Authorization header
const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;

  // Return null if header is missing or not in Bearer format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

// Basic test route
app.get("/", (req, res) => {
  res.send("API running");
});

// Get all members from the database
// Protected route: only authenticated users can access it
app.get("/member", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(`
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

// Test route to confirm token is being extracted correctly
app.get("/token-test", (req, res) => {
  const token = getTokenFromHeader(req);

  if (!token) {
    return res.status(401).json({
      error: "Missing or invalid Authorization header",
    });
  }

  res.json({
    message: "Token extracted successfully",
    token,
  });
});

// Test protected route
app.get("/protected", verifyFirebaseToken, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

// Create or update a member in the database
// Protected route: only authenticated users can create/update themselves
app.post("/member", verifyFirebaseToken, async (req, res) => {
  const { email, full_name } = req.body;

  // Get the real Firebase UID from the verified token
  const firebase_uid = req.user.uid;

  // Validate required fields
  if (!email || !full_name) {
    return res.status(400).json({
      error: "email and full_name are required",
    });
  }

  try {
    const result = await pool.query(
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

// Route to get the currently logged-in user's member record
app.get("/me", verifyFirebaseToken, async (req, res) => {
  try {
    const firebase_uid = req.user.uid;

    const result = await pool.query(
      `
      SELECT member_id, email, firebase_uid, created_at, full_name
      FROM public.member
      WHERE firebase_uid = $1
      `,
      [firebase_uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start the Express server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});