import express from "express";
import p from "./dbConnection.js";
console.log("testing");
app.get("/dbtest", async (req, res, next) => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.json(r.rows[0]);
  } catch (e) {
    next(e);
  }
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});