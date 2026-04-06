import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";
import verifyFirebaseToken from "./middleware/verifyFirebaseToken.js";
import memberRoutes from "./routes/memberRoutes.js";

const app = express();

// Load Firebase credentials
const credential = JSON.parse(
  fs.readFileSync("./config/firebase_cr.json", "utf8")
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(credential),
});

// Middleware
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

// Public test route
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

  res.json({
    message: "Token extracted successfully",
    token,
  });
});

// Protected test route
app.get("/protected", verifyFirebaseToken, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});