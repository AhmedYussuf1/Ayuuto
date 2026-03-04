  import express from "express";
 import p from "./dbConnection.js";
 //  membership
   const app = express();
app.use(express.json());

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