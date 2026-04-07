import pool from "../dbConnection.js";

export const createPayout = async (req, res) => {
  try {
    const { membership_id, amount, payout_date, status, note } = req.body;

    if (!membership_id || !amount) {
      return res.status(400).json({
        error: "membership_id and amount are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO payout (membership_id, amount, payout_date, status, note)
      VALUES ($1, $2, COALESCE($3, CURRENT_DATE), COALESCE($4, 'PENDING'), $5)
      RETURNING *
      `,
      [membership_id, amount, payout_date || null, status || null, note || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create payout error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getPayoutsByGroupId = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        p.payout_id,
        p.membership_id,
        p.amount,
        p.payout_date,
        p.status,
        p.note,
        m.member_id,
        m.group_id
      FROM payout p
      JOIN membership m
        ON p.membership_id = m.membership_id
      WHERE m.group_id = $1
      ORDER BY p.payout_date DESC, p.payout_id DESC
      `,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get payouts by group error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getPayoutsByMemberId = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        p.payout_id,
        p.membership_id,
        p.amount,
        p.payout_date,
        p.status,
        p.note,
        m.member_id,
        m.group_id
      FROM payout p
      JOIN membership m
        ON p.membership_id = m.membership_id
      WHERE m.member_id = $1
      ORDER BY p.payout_date DESC, p.payout_id DESC
      `,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get payouts by member error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updatePayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { membership_id, amount, payout_date, status, note } = req.body;

    const existing = await pool.query(
      `
      SELECT * FROM payout
      WHERE payout_id = $1
      `,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Payout not found" });
    }

    const current = existing.rows[0];

    const result = await pool.query(
      `
      UPDATE payout
      SET
        membership_id = COALESCE($1, membership_id),
        amount = COALESCE($2, amount),
        payout_date = COALESCE($3, payout_date),
        status = COALESCE($4, status),
        note = COALESCE($5, note)
      WHERE payout_id = $6
      RETURNING *
      `,
      [
        membership_id ?? current.membership_id,
        amount ?? current.amount,
        payout_date ?? current.payout_date,
        status ?? current.status,
        note ?? current.note,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update payout error:", err);
    res.status(500).json({ error: err.message });
  }
};