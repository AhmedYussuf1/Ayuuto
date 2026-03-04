 import express from "express";
 import p from "./dbConnection.js";
const app = express();
app.use(express.json());

// Basic health check (no DB)
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// DB test route (confirms Node <-> Postgres)
app.get("/dbtest", async (req, res, next) => {
  try {
    const r = await p.query("SELECT current_database() AS db, NOW() AS now");
    res.json({ ok: true, db: r.rows[0].db, now: r.rows[0].now });
  } catch (err) {
    next(err);
  }
});

// Error handler (keep LAST)
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ error: err.message });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));