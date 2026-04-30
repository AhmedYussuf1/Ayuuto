import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";

import verifyFirebaseToken from "./middleware/verifyFirebaseToken.js";

import memberRoutes from "./routes/memberRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import contributionRoutes from "./routes/contributionRoutes.js";
import payoutRoutes from "./routes/payoutRoutes.js";
import invitationRoutes from "./routes/invitationRoutes.js";

const app = express();
const PORT = 3001;

// Load Firebase credentials
const credential = JSON.parse(
  fs.readFileSync("./config/firebase_cr.json", "utf8")
);

// Initialize Firebase Admin SDK before protected routes are used
admin.initializeApp({
  credential: admin.credential.cert(credential),
});

// CORS setup
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());

// Helper function to extract token from Authorization header
const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

// Public route
app.get("/", (req, res) => {
  res.send("API running");
});

// Token test route
app.get("/token-test", (req, res) => {
  const token = getTokenFromHeader(req);

  if (!token) {
    return res.status(401).json({
      error: "Missing or invalid Authorization header",
    });
  }

  return res.json({
    message: "Token extracted successfully",
    token,
  });
});

// Protected test route
app.get("/protected", verifyFirebaseToken, (req, res) => {
  return res.json({
    message: "Access granted",
    user: req.user,
  });
});

// Routes
app.use("/member", memberRoutes);
app.use("/group", groupRoutes);
app.use("/membership", membershipRoutes);
app.use("/contribution", contributionRoutes);
app.use("/payout", payoutRoutes);
app.use("/invitation", invitationRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});