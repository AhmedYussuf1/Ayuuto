import pool from "../dbConnection.js";

export const createInvitation = async (req, res) => {
  try {
    const { group_id, email, status, invited_at } = req.body;

    if (!group_id || !email) {
      return res.status(400).json({
        error: "group_id and email are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO invitation (group_id, email, status, invited_at)
      VALUES ($1, $2, COALESCE($3, 'PENDING'), COALESCE($4, CURRENT_DATE))
      RETURNING *
      `,
      [group_id, email, status || null, invited_at || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create invitation error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getInvitationsByGroupId = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        invitation_id,
        group_id,
        email,
        status,
        invited_at
      FROM invitation
      WHERE group_id = $1
      ORDER BY invited_at DESC, invitation_id DESC
      `,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get invitations by group error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const { group_id, email, status, invited_at } = req.body;

    const existing = await pool.query(
      `
      SELECT * FROM invitation
      WHERE invitation_id = $1
      `,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    const current = existing.rows[0];

    const result = await pool.query(
      `
      UPDATE invitation
      SET
        group_id = COALESCE($1, group_id),
        email = COALESCE($2, email),
        status = COALESCE($3, status),
        invited_at = COALESCE($4, invited_at)
      WHERE invitation_id = $5
      RETURNING *
      `,
      [
        group_id ?? current.group_id,
        email ?? current.email,
        status ?? current.status,
        invited_at ?? current.invited_at,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update invitation error:", err);
    res.status(500).json({ error: err.message });
  }
};