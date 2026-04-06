import express from "express";
import pool from "../dbConnection.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

// GET /member
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT member_id, email, firebase_uid, created_at, full_name
      FROM public.member
      ORDER BY member_id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /member/firebase/:uid
router.get("/firebase/:uid", verifyFirebaseToken, async (req, res) => {
  const { uid } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT member_id, email, firebase_uid, created_at, full_name
      FROM public.member
      WHERE firebase_uid = $1
      `,
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching member by firebase uid:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /member/me
router.get("/me", verifyFirebaseToken, async (req, res) => {
  const firebase_uid = req.user.uid;

  try {
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

// GET /member/:id
router.get("/:id", verifyFirebaseToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT member_id, email, firebase_uid, created_at, full_name
      FROM public.member
      WHERE member_id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching member by id:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /member
router.post("/", verifyFirebaseToken, async (req, res) => {
  const { email, full_name } = req.body;
  const firebase_uid = req.user.uid;

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
    console.error("Error creating/updating member:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;