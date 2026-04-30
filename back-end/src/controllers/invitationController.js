 import pool from "../dbConnection.js";
import { Invitation } from "../model/invitation.ts";
import { hasOwn, isBlank } from "../utils/requestHelpers.js";
import { normalizeInvitationStatus } from "../utils/enumNormalizers.js";
import { sendDatabaseError } from "../utils/databaseErrorHandler.js";
import { mapRowToResponse, mapRowsToResponse } from "../utils/responseMappers.js";
import { invitationErrorMessages } from "../utils/errorMessages.js";


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

const invitationToResponse = (invitation) => ({
  invitation_id: invitation.getInvitationId(),
  group_id: invitation.getGroupId(),
  email: invitation.getEmail(),
  status: invitation.getStatus(),
  invited_at: invitation.getInvitedAt(),
});

 

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
      INSERT INTO public.invitation (
        group_id,
        email,
        status,
        invited_at
      )
      VALUES (
        $1,
        $2,
        COALESCE($3, 'PENDING'),
        COALESCE($4, NOW())
      )
      RETURNING invitation_id, group_id, email, status, invited_at
      `,
      [
        group_id,
        normalizeEmail(email),
        normalizedStatus ?? null,
        invited_at || null,
      ]
    );

    return res
      .status(201)
      .json(mapRowToResponse(result.rows[0], Invitation, invitationToResponse));
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Create invitation error:",
      invitationErrorMessages
    );
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

    return res.json(mapRowsToResponse(result.rows, Invitation, invitationToResponse));
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Get invitations by group error:",
      invitationErrorMessages
    );
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

    if (hasOwn(body, "group_id") && isBlank(body.group_id)) {
      return res.status(400).json({
        error: "group_id cannot be blank",
      });
    }

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

    return res.json(
      mapRowToResponse(result.rows[0], Invitation, invitationToResponse)
    );
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Update invitation error:",
      invitationErrorMessages
    );
  }
};
