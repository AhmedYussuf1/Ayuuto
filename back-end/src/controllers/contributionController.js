import pool from "../dbConnection.js";

const isBlank = (value) =>
  value === undefined || value === null || String(value).trim() === "";

const normalizeContributionStatus = (status) => {
  if (status === undefined) {
    return undefined;
  }

  if (status === null || String(status).trim() === "") {
    return null;
  }

  const normalized = String(status).trim().toUpperCase();
  return ["PENDING", "PAID", "FAILED", "REFUNDED"].includes(normalized)
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

  if (err.code === "23505") {
    return res.status(409).json({
      error: "Only one contribution per membership per day is allowed",
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

export const createContribution = async (req, res) => {
  try {
    const {
      membership_id,
      amount,
      contribution_date,
      status,
      note,
    } = req.body;

    if (isBlank(membership_id) || !isValidNonNegativeNumber(amount)) {
      return res.status(400).json({
        error: "membership_id and a non-negative amount are required",
      });
    }

    const normalizedStatus = normalizeContributionStatus(status);

    if (status !== undefined && !normalizedStatus) {
      return res.status(400).json({
        error: "status must be PENDING, PAID, FAILED, or REFUNDED",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO public.contribution (
        membership_id,
        amount,
        contribution_date,
        status,
        note
      )
      VALUES (
        $1,
        $2,
        COALESCE($3, CURRENT_DATE),
        COALESCE($4, 'PAID'),
        $5
      )
      RETURNING contribution_id, membership_id, amount, contribution_date, status, note
      `,
      [
        membership_id,
        amount,
        contribution_date || null,
        normalizedStatus ?? null,
        toNullableText(note) ?? null,
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return sendDatabaseError(res, err, "Create contribution error:");
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
        c.note,
        ms.member_id,
        ms.group_id,
        m.full_name,
        m.email
      FROM public.contribution c
      JOIN public.membership ms
        ON c.membership_id = ms.membership_id
      JOIN public.member m
        ON ms.member_id = m.member_id
      WHERE ms.group_id = $1
      ORDER BY c.contribution_date DESC, c.contribution_id DESC
      `,
      [id]
    );

    return res.json(result.rows);
  } catch (err) {
    return sendDatabaseError(res, err, "Get contributions by group error:");
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
        c.note,
        ms.member_id,
        ms.group_id,
        m.full_name,
        m.email
      FROM public.contribution c
      JOIN public.membership ms
        ON c.membership_id = ms.membership_id
      JOIN public.member m
        ON ms.member_id = m.member_id
      WHERE ms.member_id = $1
      ORDER BY c.contribution_date DESC, c.contribution_id DESC
      `,
      [id]
    );

    return res.json(result.rows);
  } catch (err) {
    return sendDatabaseError(res, err, "Get contributions by member error:");
  }
};
