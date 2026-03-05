  import express from "express";
 import p from "./dbConnection.js";
 import admin from "firebase-admin";
 import fs from 'fs'
 const credential = JSON.parse(fs.readFileSync("../firebase_cr.json"));

 //  membership
   const app = express();
app.use(express.json());
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));

admin.initializeApp({
  credential: admin.credential.cert(credential);
});
app.get("/", (req, res) => res.send("API running"));

app.get("/member", async (req, res) => {
  try {
    const result = await p.query('SELECT * FROM public."member"');
    res.json(result.rows);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));