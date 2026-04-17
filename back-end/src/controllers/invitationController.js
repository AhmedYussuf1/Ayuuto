import pool from "../dbConnection.js";

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const isBlank = (value) =>
  value === undefined || value === null || String(value).trim() === "";

const normalizeInvitationStatus = (status) => {
  if (status === undefined) {
    return undefined;
  }

  if (status === null || String(status).trim() === "") {
    return null;
  }

  const normalized = String(status).trim().toUpperCase();
  return ["PENDING", "ACCEPTED", "EXPIRED", "CANCELED"].includes(normalized)
    ? normalized
    : null;
};

const normalizeEmail = (email) => {
  if (email === undefined) {
    return undefined;
  }

  if (email === null) {
    return null;
  }

  const trimmed = String(email).trim();
  return trimmed === "" ? null : trimmed;
};

const sendDatabaseError = (res, err, contextMessage) => {
  console.error(contextMessage, err);

  if (err.code === "23503") {
    return res.status(400).json({
      error: "group_id does not reference an existing group",
      detail: err.detail,
    });
  }

  if (err.code === "23505") {
    return res.status(409).json({
      error: "A pending invitation already exists for this email in this group",
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

export const createInvitation = async (req, res) => {
  try {
    const { group_id, email, status, invited_at } = req.body;

    if (isBlank(group_id) || isBlank(email)) {
      return res.status(400).json({
        error: "group_id and email are required",
      });
    }

    const normalizedStatus = normalizeInvitationStatus(status);

    if (status !== undefined && !normalizedStatus) {
      return res.status(400).json({
        error: "status must be PENDING, ACCEPTED, EXPIRED, or CANCELED",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO public.invitation (group_id, email, status, invited_at)
      VALUES ($1, $2, COALESCE($3, 'PENDING'), COALESCE($4, NOW()))
      RETURNING invitation_id, group_id, email, status, invited_at
      `,
      [group_id, normalizeEmail(email), normalizedStatus ?? null, invited_at || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return sendDatabaseError(res, err, "Create invitation error:");
  }
};

export const getInvitationsByGroupId = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT invitation_id, group_id, email, status, invited_at
      FROM public.invitation
      WHERE group_id = $1
      ORDER BY invited_at DESC, invitation_id DESC
      `,
      [id]
    );

    return res.json(result.rows);
  } catch (err) {
    return sendDatabaseError(res, err, "Get invitations by group error:");
  }
};

export const updateInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await pool.query(
      `
      SELECT invitation_id, group_id, email, status, invited_at
      FROM public.invitation
      WHERE invitation_id = $1
      `,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    const current = existing.rows[0];

    if (hasOwn(body, "email") && !normalizeEmail(body.email)) {
      return res.status(400).json({
        error: "email cannot be blank",
      });
    }

    const normalizedStatus = hasOwn(body, "status")
      ? normalizeInvitationStatus(body.status)
      : undefined;

    if (hasOwn(body, "status") && !normalizedStatus) {
      return res.status(400).json({
        error: "status must be PENDING, ACCEPTED, EXPIRED, or CANCELED",
      });
    }

    const result = await pool.query(
      `
      UPDATE public.invitation
      SET
        group_id = $1,
        email = $2,
        status = $3,
        invited_at = $4
      WHERE invitation_id = $5
      RETURNING invitation_id, group_id, email, status, invited_at
      `,
      [
        hasOwn(body, "group_id") ? body.group_id : current.group_id,
        hasOwn(body, "email") ? normalizeEmail(body.email) : current.email,
        hasOwn(body, "status") ? normalizedStatus : current.status,
        hasOwn(body, "invited_at") ? body.invited_at : current.invited_at,
        id,
      ]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    return sendDatabaseError(res, err, "Update invitation error:");
  }
};
