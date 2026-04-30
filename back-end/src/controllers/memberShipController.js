import pool from "../dbConnection.js";
import { Membership } from "../model/membership.ts";
import {
  hasOwn,
  isBlank,
  normalizePositiveInteger,
} from "../utils/requestHelpers.js";
 import { groupErrorMessages } from "../utils/errorMessages.js";
 import  {sendDatabaseError}  from  "../utils/databaseErrorHandler.js";
   
import {
  normalizeRole,
  normalizeMembershipStatus,
} from "../utils/enumNormalizers.js";
 import { mapRowToResponse } from "../utils/responseMappers.js";

const membershipToResponse = (membership) => ({
  membership_id: membership.getMembershipId(),
  member_id: membership.getMemberId(),
  group_id: membership.getGroupId(),
  role: membership.getRole(),
  status: membership.getStatus(),
  payout_position: membership.getPayoutPosition(),
  joined_date: membership.getJoinedDate(),
  left_date: membership.getLeftDate(),
});

const membershipRowToResponse = (row) => {
  const membership = Membership.fromDatabase(row);

  return {
    ...membershipToResponse(membership),
    full_name: row.full_name,
    email: row.email,
    group_name: row.group_name,
    start_cycle_date: row.start_cycle_date,
    notes: row.notes,
    created_at: row.created_at,
  };
};



export const createMembership = async (req, res) => {
  const {
    member_id,
    group_id,
    role,
    status,
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

  const normalizedStatus = normalizeMembershipStatus(status);

  if (status !== undefined && !normalizedStatus) {
    return res.status(400).json({
      error: "status must be PENDING, APPROVED, or REJECTED",
    });
  }

  const normalizedPayoutPosition = normalizePositiveInteger(payout_position);

  if (
    payout_position !== undefined &&
    payout_position !== null &&
    payout_position !== "" &&
    !normalizedPayoutPosition
  ) {
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
        status,
        payout_position,
        joined_date,
        left_date
      )
      VALUES (
        $1,
        $2,
        COALESCE($3, 'MEMBER'),
        COALESCE($4, 'PENDING'),
        $5,
        COALESCE($6, CURRENT_DATE),
        $7
      )
      RETURNING
        membership_id,
        member_id,
        group_id,
        role,
        status,
        payout_position,
        joined_date,
        left_date
      `,
      [
        member_id,
        group_id,
        normalizedRole ?? null,
        normalizedStatus ?? null,
        normalizedPayoutPosition ?? null,
        joined_date || null,
        left_date || null,
      ]
    );

    return res
      .status(201)
      .json(mapRowToResponse(result.rows[0], Membership, membershipToResponse));
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Error creating membership:",
      membershipErrorMessages
    );
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
        ms.status,
        ms.payout_position,
        ms.joined_date,
        ms.left_date,
        m.full_name,
        m.email
      FROM public.membership ms
      JOIN public.member m
        ON ms.member_id = m.member_id
      WHERE ms.group_id = $1
      ORDER BY
        ms.left_date NULLS FIRST,
        ms.payout_position NULLS LAST,
        ms.membership_id
      `,
      [id]
    );

    return res.json(result.rows.map(membershipRowToResponse));
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Error fetching memberships by group:",
      membershipErrorMessages
    );
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
        ms.status,
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

    return res.json(result.rows.map(membershipRowToResponse));
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Error fetching memberships by member:",
      membershipErrorMessages
    );
  }
};

export const updateMembership = async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  try {
    const existing = await pool.query(
      `
      SELECT
        membership_id,
        member_id,
        group_id,
        role,
        status,
        payout_position,
        joined_date,
        left_date
      FROM public.membership
      WHERE membership_id = $1
      `,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Membership not found" });
    }

    const current = existing.rows[0];

    const normalizedRole = hasOwn(body, "role")
      ? normalizeRole(body.role)
      : undefined;

    if (hasOwn(body, "role") && !normalizedRole) {
      return res.status(400).json({
        error: "role must be ADMIN or MEMBER",
      });
    }

    const normalizedStatus = hasOwn(body, "status")
      ? normalizeMembershipStatus(body.status)
      : undefined;

    if (hasOwn(body, "status") && !normalizedStatus) {
      return res.status(400).json({
        error: "status must be PENDING, APPROVED, or REJECTED",
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
        status = $2,
        payout_position = $3,
        joined_date = $4,
        left_date = $5
      WHERE membership_id = $6
      RETURNING
        membership_id,
        member_id,
        group_id,
        role,
        status,
        payout_position,
        joined_date,
        left_date
      `,
      [
        hasOwn(body, "role") ? normalizedRole : current.role,
        hasOwn(body, "status") ? normalizedStatus : current.status,
        hasOwn(body, "payout_position")
          ? normalizedPayoutPosition
          : current.payout_position,
        hasOwn(body, "joined_date") ? body.joined_date : current.joined_date,
        hasOwn(body, "left_date") ? body.left_date : current.left_date,
        id,
      ]
    );

    return res.json(
      mapRowToResponse(result.rows[0], Membership, membershipToResponse)
    );
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Error updating membership:",
      membershipErrorMessages
    );
  }
};