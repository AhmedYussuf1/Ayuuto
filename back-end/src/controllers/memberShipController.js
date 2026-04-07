import pool from "../dbConnection.js";

// POST /membership
export const createMembership = async (req, res) => {
  const { member_id, group_id, role, payout_position } = req.body;

  if (!member_id || !group_id) {
    return res.status(400).json({
      error: "member_id and group_id are required",
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO public.membership (member_id, group_id, role, payout_position)
      VALUES ($1, $2, $3, $4)
      RETURNING membership_id, member_id, group_id, role, payout_position, joined_date, left_date
      `,
      [
        member_id,
        group_id,
        role || "MEMBER",
        payout_position || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating membership:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /membership/group/:id
export const getMembershipsByGroupId = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        ms.membership_id,
        ms.member_id,
        ms.group_id,
        ms.role,
        ms.payout_position,
        ms.joined_date,
        ms.left_date,
        m.full_name,
        m.email
      FROM public.membership ms
      JOIN public.member m
        ON ms.member_id = m.member_id
      WHERE ms.group_id = $1
      ORDER BY ms.payout_position NULLS LAST, ms.membership_id
      `,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching memberships by group:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /membership/member/:id
export const getMembershipsByMemberId = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        ms.membership_id,
        ms.member_id,
        ms.group_id,
        ms.role,
        ms.payout_position,
        ms.joined_date,
        ms.left_date,
        g.group_name,
        g.start_cycle_date
      FROM public.membership ms
      JOIN public."group" g
        ON ms.group_id = g.group_id
      WHERE ms.member_id = $1
      ORDER BY ms.membership_id
      `,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching memberships by member:", err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /membership/:id
export const updateMembership = async (req, res) => {
  const { id } = req.params;
  const { role, payout_position, left_date } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE public.membership
      SET
        role = COALESCE($1, role),
        payout_position = COALESCE($2, payout_position),
        left_date = COALESCE($3, left_date)
      WHERE membership_id = $4
      RETURNING membership_id, member_id, group_id, role, payout_position, joined_date, left_date
      `,
      [role, payout_position, left_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Membership not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating membership:", err);
    res.status(500).json({ error: err.message });
  }
};