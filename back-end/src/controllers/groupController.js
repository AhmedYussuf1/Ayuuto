import pool from "../dbConnection.js";

// POST /group
export const createGroup = async (req, res) => {
  const { group_name, start_cycle_date } = req.body;

  if (!group_name || !start_cycle_date) {
    return res.status(400).json({
      error: "group_name and start_cycle_date are required",
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO public."group" (group_name, start_cycle_date)
      VALUES ($1, $2)
      RETURNING group_id, group_name, start_cycle_date
      `,
      [group_name, start_cycle_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /group/:id
export const getGroupById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT group_id, group_name, start_cycle_date
      FROM public."group"
      WHERE group_id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching group by id:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /group/member/:id
export const getMembersByGroupId = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        m.member_id,
        m.full_name,
        m.email,
        ms.role,
        ms.payout_position,
        ms.joined_date
      FROM public.membership ms
      JOIN public.member m
        ON ms.member_id = m.member_id
      WHERE ms.group_id = $1
      ORDER BY ms.payout_position NULLS LAST, m.member_id
      `,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching group members:", err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /group/:id
export const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { group_name, start_cycle_date } = req.body;

  if (!group_name || !start_cycle_date) {
    return res.status(400).json({
      error: "group_name and start_cycle_date are required",
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE public."group"
      SET group_name = $1,
          start_cycle_date = $2
      WHERE group_id = $3
      RETURNING group_id, group_name, start_cycle_date
      `,
      [group_name, start_cycle_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating group:", err);
    res.status(500).json({ error: err.message });
  }
};