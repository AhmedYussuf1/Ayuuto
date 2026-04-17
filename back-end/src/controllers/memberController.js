import pool from "../dbConnection.js";

const isBlank = (value) =>
  value === undefined || value === null || String(value).trim() === "";

const normalizeText = (value) => String(value).trim();

const sendDatabaseError = (res, err, contextMessage) => {
  console.error(contextMessage, err);

  if (err.code === "23505") {
    if (err.constraint && err.constraint.includes("email")) {
      return res.status(409).json({
        error: "That email is already in use by another member",
        detail: err.detail,
      });
    }

    if (err.constraint && err.constraint.includes("firebase_uid")) {
      return res.status(409).json({
        error: "That Firebase account is already linked to another member",
        detail: err.detail,
      });
    }

    return res.status(409).json({
      error: "This member conflicts with an existing record",
      detail: err.detail,
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

export const getAllMembers = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT member_id, full_name, email,  created_at
      FROM public.member
      ORDER BY member_id
      `
    );

    return res.json(result.rows);
  } catch (err) {
    return sendDatabaseError(res, err, "Error fetching members:");
  }
};

export const getMemberByFirebaseUid = async (req, res) => {
  const { uid } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT member_id, full_name, email,   created_at
      FROM public.member
      WHERE firebase_uid = $1
      `,
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return sendDatabaseError(res, err, "Error fetching member by firebase uid:");
  }
};

export const getCurrentMember = async (req, res) => {
  const firebaseUid = req.user?.uid;

  try {
    const result = await pool.query(
      `
      SELECT member_id, full_name, email, firebase_uid, created_at
      FROM public.member
      WHERE firebase_uid = $1
      `,
      [firebaseUid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return sendDatabaseError(res, err, "Error fetching current member:");
  }
};

export const getMemberById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT member_id, full_name, email,   created_at
      FROM public.member
      WHERE member_id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return sendDatabaseError(res, err, "Error fetching member by id:");
  }
};

export const createOrUpdateMember = async (req, res) => {
  const { email, full_name } = req.body;
  const firebaseUid = req.user?.uid;
  let client;

  if (isBlank(email) || isBlank(full_name)) {
    return res.status(400).json({
      error: "email and full_name are required",
    });
  }

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const normalizedEmail = normalizeText(email);
    const normalizedFullName = normalizeText(full_name);

    const matchResult = await client.query(
      `
      SELECT member_id, email, firebase_uid
      FROM public.member
      WHERE firebase_uid = $1 OR email = $2
      ORDER BY member_id
      `,
      [firebaseUid, normalizedEmail]
    );

    if (matchResult.rows.length > 1) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error:
          "This request matches multiple member records. Resolve the duplicate email/Firebase account mapping first.",
      });
    }

    let result;
    let statusCode;

    if (matchResult.rows.length === 0) {
      result = await client.query(
        `
        INSERT INTO public.member (full_name, email, firebase_uid)
        VALUES ($1, $2, $3)
        RETURNING member_id, full_name, email, firebase_uid, created_at
        `,
        [normalizedFullName, normalizedEmail, firebaseUid]
      );
      statusCode = 201;
    } else {
      result = await client.query(
        `
        UPDATE public.member
        SET
          full_name = $1,
          email = $2,
          firebase_uid = $3
        WHERE member_id = $4
        RETURNING member_id, full_name, email, firebase_uid, created_at
        `,
        [
          normalizedFullName,
          normalizedEmail,
          firebaseUid,
          matchResult.rows[0].member_id,
        ]
      );
      statusCode = 200;
    }

    await client.query("COMMIT");
    return res.status(statusCode).json(result.rows[0]);
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }

    return sendDatabaseError(res, err, "Error creating/updating member:");
  } finally {
    if (client) {
      client.release();
    }
  }
};
