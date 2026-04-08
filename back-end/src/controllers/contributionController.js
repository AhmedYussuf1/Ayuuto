import pool from "../dbConnection.js";

export const createContribution = async (req, res) => {
  try {
    const { membership_id, amount, contribution_date, status } = req.body;

    if (!membership_id || !amount) {
      return res.status(400).json({
        error: "membership_id and amount are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO contribution (membership_id, amount, contribution_date, status)
      VALUES ($1, $2, COALESCE($3, CURRENT_DATE), COALESCE($4, 'PAID'))
      RETURNING *
      `,
      [membership_id, amount, contribution_date || null, status || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create contribution error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getContributionsByGroupId = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        c.contribution_id,
        c.membership_id,
        c.amount,
        c.contribution_date,
        c.status,
        m.member_id,
        m.group_id
      FROM contribution c
      JOIN membership m
        ON c.membership_id = m.membership_id
      WHERE m.group_id = $1
      ORDER BY c.contribution_date DESC, c.contribution_id DESC
      `,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get contributions by group error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getContributionsByMemberId = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        c.contribution_id,
        c.membership_id,
        c.amount,
        c.contribution_date,
        c.status,
        m.member_id,
        m.group_id
      FROM contribution c
      JOIN membership m
        ON c.membership_id = m.membership_id
      WHERE m.member_id = $1
      ORDER BY c.contribution_date DESC, c.contribution_id DESC
      `,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get contributions by member error:", err);
    res.status(500).json({ error: err.message });
  }
};