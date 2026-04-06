import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";
import verifyFirebaseToken from "./middleware/verifyFirebaseToken.js";
import memberRoutes from "./routes/memberRoutes.js";

const app = express();

// Read Firebase service account credentials from local JSON file
const credential = JSON.parse(
  fs.readFileSync("./config/firebase_cr.json", "utf8")
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(credential),
});

// Middleware
app.use(express.json());
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));

// Member routes
app.use("/member", memberRoutes);

// Helper function to extract token from Authorization header
const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

// Basic test route
app.get("/", (req, res) => {
  res.send("API running");
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

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});