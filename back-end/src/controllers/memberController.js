import pool from "../dbConnection.js";
import { Member } from "../model/member.ts";
import { isBlank, normalizeText } from "../utils/requestHelpers.js";
import { AppError, sendDatabaseError } from "../utils/databaseErrorHandler.js";
import { runInTransaction } from "../utils/transactionManager.js";
import { mapRowToResponse, mapRowsToResponse } from "../utils/responseMappers.js";
import { memberErrorMessages } from "../utils/errorMessages.js";

const memberToResponse = (member) => ({
  member_id: member.getMemberId(),
  full_name: member.getFullName(),
  email: member.getEmail(),
  firebase_uid: member.getFirebaseUid(),
  created_at: member.getCreatedAt(),
});

 

export const getAllMembers = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        member_id,
        full_name,
        email,
        firebase_uid,
        created_at
      FROM public.member
      ORDER BY member_id
      `
    );

    return res.json(mapRowsToResponse(result.rows, Member, memberToResponse));
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Error fetching members:",
      memberErrorMessages
    );
  }
};

export const getMemberByFirebaseUid = async (req, res) => {
  const { uid } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        member_id,
        full_name,
        email,
        firebase_uid,
        created_at
      FROM public.member
      WHERE firebase_uid = $1
      `,
      [uid]
    );

    const member = mapRowToResponse(result.rows[0], Member, memberToResponse);

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    return res.json(member);
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Error fetching member by firebase uid:",
      memberErrorMessages
    );
  }
};

export const getCurrentMember = async (req, res) => {
  const firebaseUid = req.user?.uid;

  try {
    const result = await pool.query(
      `
      SELECT
        member_id,
        full_name,
        email,
        firebase_uid,
        created_at
      FROM public.member
      WHERE firebase_uid = $1
      `,
      [firebaseUid]
    );

    const member = mapRowToResponse(result.rows[0], Member, memberToResponse);

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    return res.json(member);
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Error fetching current member:",
      memberErrorMessages
    );
  }
};

export const getMemberById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        member_id,
        full_name,
        email,
        firebase_uid,
        created_at
      FROM public.member
      WHERE member_id = $1
      `,
      [id]
    );

    const member = mapRowToResponse(result.rows[0], Member, memberToResponse);

    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    return res.json(member);
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Error fetching member by id:",
      memberErrorMessages
    );
  }
};

export const createOrUpdateMember = async (req, res) => {
  const { email, full_name } = req.body;
  const firebaseUid = req.user?.uid;

  if (isBlank(email) || isBlank(full_name)) {
    return res.status(400).json({
      error: "email and full_name are required",
    });
  }

  try {
    const { statusCode, member } = await runInTransaction(async (client) => {
      const normalizedEmail = normalizeText(email);
      const normalizedFullName = normalizeText(full_name);

      const matchResult = await client.query(
        `
        SELECT
          member_id,
          email,
          firebase_uid
        FROM public.member
        WHERE firebase_uid = $1 OR email = $2
        ORDER BY member_id
        `,
        [firebaseUid, normalizedEmail]
      );

      if (matchResult.rows.length > 1) {
        throw new AppError(409, {
          error:
            "This request matches multiple member records. Resolve the duplicate email/Firebase account mapping first.",
        });
      }

      let result;
      let statusCode;

      if (matchResult.rows.length === 0) {
        result = await client.query(
          `
          INSERT INTO public.member (
            full_name,
            email,
            firebase_uid
          )
          VALUES ($1, $2, $3)
          RETURNING
            member_id,
            full_name,
            email,
            firebase_uid,
            created_at
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
          RETURNING
            member_id,
            full_name,
            email,
            firebase_uid,
            created_at
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

      return {
        statusCode,
        member: mapRowToResponse(result.rows[0], Member, memberToResponse),
      };
    });

    return res.status(statusCode).json(member);
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Error creating/updating member:",
      memberErrorMessages
    );
  }
};