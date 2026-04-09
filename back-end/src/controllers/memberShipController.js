import pool from "../dbConnection.js";

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const isBlank = (value) =>
  value === undefined || value === null || String(value).trim() === "";

const normalizeRole = (role) => {
  if (role === undefined) {
    return undefined;
  }

  if (role === null || String(role).trim() === "") {
    return null;
  }

  const normalized = String(role).trim().toUpperCase();
  return ["ADMIN", "MEMBER"].includes(normalized) ? normalized : null;
};

const normalizePositiveInteger = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const sendDatabaseError = (res, err, contextMessage) => {
  console.error(contextMessage, err);

  if (err.code === "23503") {
    return res.status(400).json({
      error: "member_id or group_id does not reference an existing record",
      detail: err.detail,
    });
  }

  if (err.code === "23505") {
    if (err.constraint === "uq_membership_member_group") {
      return res.status(409).json({
        error: "That member is already in this group",
        detail: err.detail,
      });
    }

    if (err.constraint === "uq_active_payout_position_per_group") {
      return res.status(409).json({
        error: "That payout_position is already assigned to an active member in this group",
        detail: err.detail,
      });
    }

    return res.status(409).json({
      error: "This membership conflicts with an existing record",
      detail: err.detail,
    });
  }

  if (err.code === "23514") {
    return res.status(400).json({
      error: "One or more values do not satisfy the database rules",
      detail: err.detail || err.message,
    });
  }

  if (err.code === "22P02") {
    return res.status(400).json({
      error: "One or more values have an invalid format",
      detail: err.message,
    });
  }

  return res.status(500).json({ error: err.message });
};

export const createMembership = async (req, res) => {
  const {
    member_id,
    group_id,
    role,
    payout_position,
    joined_date,
    left_date,
  } = req.body;

  if (isBlank(member_id) || isBlank(group_id)) {
    return res.status(400).json({
      error: "member_id and group_id are required",
    });
  }

  const normalizedRole = normalizeRole(role);
  if (role !== undefined && !normalizedRole) {
    return res.status(400).json({
      error: "role must be ADMIN or MEMBER",
    });
  }

  const normalizedPayoutPosition = normalizePositiveInteger(payout_position);
  if (payout_position !== undefined && payout_position !== null && payout_position !== "" && !normalizedPayoutPosition) {
    return res.status(400).json({
      error: "payout_position must be a positive integer",
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO public.membership (
        member_id,
        group_id,
        role,
        payout_position,
        joined_date,
        left_date
      )
      VALUES (
        $1,
        $2,
        COALESCE($3, 'MEMBER'),
        $4,
        COALESCE($5, CURRENT_DATE),
        $6
      )
      RETURNING membership_id, member_id, group_id, role, payout_position, joined_date, left_date
      `,
      [
        member_id,
        group_id,
        normalizedRole ?? null,
        normalizedPayoutPosition ?? null,
        joined_date || null,
        left_date || null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return sendDatabaseError(res, err, "Error creating membership:");
  }
};

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
      ORDER BY ms.left_date NULLS FIRST, ms.payout_position NULLS LAST, ms.membership_id
      `,
      [id]
    );

    return res.json(result.rows);
  } catch (err) {
    return sendDatabaseError(res, err, "Error fetching memberships by group:");
  }
};

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
        g.start_cycle_date,
        g.notes,
        g.created_at
      FROM public.membership ms
      JOIN public."group" g
        ON ms.group_id = g.group_id
      WHERE ms.member_id = $1
      ORDER BY ms.left_date NULLS FIRST, ms.membership_id
      `,
      [id]
    );

    return res.json(result.rows);
  } catch (err) {
    return sendDatabaseError(res, err, "Error fetching memberships by member:");
  }
};

export const updateMembership = async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  try {
    const existing = await pool.query(
      `
      SELECT membership_id, member_id, group_id, role, payout_position, joined_date, left_date
      FROM public.membership
      WHERE membership_id = $1
      `,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Membership not found" });
    }

    const current = existing.rows[0];

    const normalizedRole = hasOwn(body, "role") ? normalizeRole(body.role) : undefined;
    if (hasOwn(body, "role") && !normalizedRole) {
      return res.status(400).json({
        error: "role must be ADMIN or MEMBER",
      });
    }

    const normalizedPayoutPosition = hasOwn(body, "payout_position")
      ? normalizePositiveInteger(body.payout_position)
      : undefined;

    if (
      hasOwn(body, "payout_position") &&
      body.payout_position !== null &&
      body.payout_position !== "" &&
      !normalizedPayoutPosition
    ) {
      return res.status(400).json({
        error: "payout_position must be a positive integer",
      });
    }

    const result = await pool.query(
      `
      UPDATE public.membership
      SET
        role = $1,
        payout_position = $2,
        joined_date = $3,
        left_date = $4
      WHERE membership_id = $5
      RETURNING membership_id, member_id, group_id, role, payout_position, joined_date, left_date
      `,
      [
        hasOwn(body, "role") ? normalizedRole : current.role,
        hasOwn(body, "payout_position")
          ? normalizedPayoutPosition
          : current.payout_position,
        hasOwn(body, "joined_date") ? body.joined_date : current.joined_date,
        hasOwn(body, "left_date") ? body.left_date : current.left_date,
        id,
      ]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    return sendDatabaseError(res, err, "Error updating membership:");
  }
};
