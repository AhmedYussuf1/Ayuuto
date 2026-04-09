import pool from "../dbConnection.js";

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const isBlank = (value) =>
  value === undefined || value === null || String(value).trim() === "";

const normalizePayoutStatus = (status) => {
  if (status === undefined) {
    return undefined;
  }

  if (status === null || String(status).trim() === "") {
    return null;
  }

  const normalized = String(status).trim().toUpperCase();
  return ["PENDING", "PAID", "MISSED", "CANCELED"].includes(normalized)
    ? normalized
    : null;
};

const toNullableText = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
};

const isValidNonNegativeNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return false;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
};

const sendDatabaseError = (res, err, contextMessage) => {
  console.error(contextMessage, err);

  if (err.code === "23503") {
    return res.status(400).json({
      error: "membership_id does not reference an existing membership",
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

export const createPayout = async (req, res) => {
  try {
    const { membership_id, amount, payout_date, status, note } = req.body;

    if (isBlank(membership_id) || !isValidNonNegativeNumber(amount)) {
      return res.status(400).json({
        error: "membership_id and a non-negative amount are required",
      });
    }

    const normalizedStatus = normalizePayoutStatus(status);
    if (status !== undefined && !normalizedStatus) {
      return res.status(400).json({
        error: "status must be PENDING, PAID, MISSED, or CANCELED",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO public.payout (membership_id, amount, payout_date, status, note)
      VALUES ($1, $2, COALESCE($3, CURRENT_DATE), COALESCE($4, 'PENDING'), $5)
      RETURNING payout_id, membership_id, amount, payout_date, status, note
      `,
      [
        membership_id,
        amount,
        payout_date || null,
        normalizedStatus ?? null,
        toNullableText(note) ?? null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return sendDatabaseError(res, err, "Create payout error:");
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
        ms.member_id,
        ms.group_id,
        m.full_name,
        m.email
      FROM public.payout p
      JOIN public.membership ms
        ON p.membership_id = ms.membership_id
      JOIN public.member m
        ON ms.member_id = m.member_id
      WHERE ms.group_id = $1
      ORDER BY p.payout_date DESC, p.payout_id DESC
      `,
      [id]
    );

    return res.json(result.rows);
  } catch (err) {
    return sendDatabaseError(res, err, "Get payouts by group error:");
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
        ms.member_id,
        ms.group_id,
        m.full_name,
        m.email
      FROM public.payout p
      JOIN public.membership ms
        ON p.membership_id = ms.membership_id
      JOIN public.member m
        ON ms.member_id = m.member_id
      WHERE ms.member_id = $1
      ORDER BY p.payout_date DESC, p.payout_id DESC
      `,
      [id]
    );

    return res.json(result.rows);
  } catch (err) {
    return sendDatabaseError(res, err, "Get payouts by member error:");
  }
};

export const updatePayout = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await pool.query(
      `
      SELECT payout_id, membership_id, amount, payout_date, status, note
      FROM public.payout
      WHERE payout_id = $1
      `,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Payout not found" });
    }

    const current = existing.rows[0];

    if (hasOwn(body, "amount") && !isValidNonNegativeNumber(body.amount)) {
      return res.status(400).json({
        error: "amount must be 0 or greater",
      });
    }

    const normalizedStatus = hasOwn(body, "status")
      ? normalizePayoutStatus(body.status)
      : undefined;

    if (hasOwn(body, "status") && !normalizedStatus) {
      return res.status(400).json({
        error: "status must be PENDING, PAID, MISSED, or CANCELED",
      });
    }

    const result = await pool.query(
      `
      UPDATE public.payout
      SET
        membership_id = $1,
        amount = $2,
        payout_date = $3,
        status = $4,
        note = $5
      WHERE payout_id = $6
      RETURNING payout_id, membership_id, amount, payout_date, status, note
      `,
      [
        hasOwn(body, "membership_id") ? body.membership_id : current.membership_id,
        hasOwn(body, "amount") ? body.amount : current.amount,
        hasOwn(body, "payout_date") ? body.payout_date : current.payout_date,
        hasOwn(body, "status") ? normalizedStatus : current.status,
        hasOwn(body, "note") ? toNullableText(body.note) : current.note,
        id,
      ]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    return sendDatabaseError(res, err, "Update payout error:");
  }
};
