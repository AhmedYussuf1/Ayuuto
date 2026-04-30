 import pool from "../dbConnection.js";
import { Contribution } from "../model/contribution.ts";
import {
  isBlank,
  isValidNonNegativeNumber,
  toNullableText,
} from "../utils/requestHelpers.js";
import { normalizeContributionStatus } from "../utils/enumNormalizers.js";
import { sendDatabaseError } from "../utils/databaseErrorHandler.js";
import { contributionErrorMessages } from "../utils/errorMessages.js";
import { mapRowToResponse } from "../utils/responseMappers.js";
const contributionToResponse = (contribution) => ({
  contribution_id: contribution.getContributionId(),
  membership_id: contribution.getMembershipId(),
  amount: contribution.getAmount(),
  contribution_date: contribution.getContributionDate(),
  status: contribution.getStatus(),
  note: contribution.getNote(),
});

const contributionRowToResponse = (row) => {
  const contribution = Contribution.fromDatabase(row);

  return {
    ...contributionToResponse(contribution),
    member_id: row.member_id,
    group_id: row.group_id,
    full_name: row.full_name,
    email: row.email,
  };
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
      RETURNING
        contribution_id,
        membership_id,
        amount,
        contribution_date,
        status,
        note
      `,
      [
        membership_id,
        amount,
        contribution_date || null,
        normalizedStatus ?? null,
        toNullableText(note) ?? null,
      ]
    );

    return res
      .status(201)
      .json(
        mapRowToResponse(result.rows[0], Contribution, contributionToResponse)
      );
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Create contribution error:",
      contributionErrorMessages
    );
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

    return res.json(result.rows.map(contributionRowToResponse));
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Get contributions by group error:",
      contributionErrorMessages
    );
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

    return res.json(result.rows.map(contributionRowToResponse));
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Get contributions by member error:",
      contributionErrorMessages
    );
  }
};