import pool from "../dbConnection.js";
import { Group } from "../model/group.ts";
import { Membership } from "../model/membership.ts";
import { PayoutCycle } from "../model/payoutCycle.ts";
import {
  hasOwn,
  isBlank,
  isValidNonNegativeNumber,
  toNullableText,
} from "../utils/requestHelpers.js";
import { groupErrorMessages } from "../utils/errorMessages.js";
import {
  normalizeCycleStatus,
  normalizeFrequency,
} from "../utils/enumNormalizers.js";
import { AppError, sendDatabaseError } from "../utils/databaseErrorHandler.js";
import { runInTransaction } from "../utils/transactionManager.js";
import { mapRowToResponse } from "../utils/responseMappers.js";

const groupToResponse = (group) => ({
  group_id: group.getGroupId(),
  group_name: group.getGroupName(),
  start_cycle_date: group.getStartCycleDate(),
  notes: group.getNotes(),
  invite_code: group.getInviteCode(),
  created_at: group.getCreatedAt(),
});

const payoutCycleToResponse = (payoutCycle) => ({
  payout_cycle_id: payoutCycle.getPayoutCycleId(),
  group_id: payoutCycle.getGroupId(),
  frequency: payoutCycle.getFrequency(),
  contribution_amount: payoutCycle.getContributionAmount(),
  status: payoutCycle.getStatus(),
  current_recipient_membership_id:
    payoutCycle.getCurrentRecipientMembershipId(),
});

const payoutCycleRowToResponse = (row) => {
  if (!row) {
    return null;
  }

  const payoutCycle = PayoutCycle.fromDatabase(row);

  return {
    ...payoutCycleToResponse(payoutCycle),
    current_recipient_member_id: row.current_recipient_member_id ?? null,
    current_recipient_full_name: row.current_recipient_full_name ?? null,
    current_recipient_email: row.current_recipient_email ?? null,
  };
};

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
  };
};

 

const generateInviteCode = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

const createUniqueInviteCode = async (client) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const inviteCode = generateInviteCode();

    const existing = await client.query(
      `
      SELECT group_id
      FROM public."group"
      WHERE invite_code = $1
      `,
      [inviteCode]
    );

    if (existing.rows.length === 0) {
      return inviteCode;
    }
  }

  throw new AppError(500, {
    error: "Could not generate a unique invite code",
  });
};

const getGroupDetails = async (client, groupId) => {
  const groupResult = await client.query(
    `
    SELECT
      g.group_id,
      g.group_name,
      g.start_cycle_date,
      g.notes,
      g.invite_code,
      g.created_at
    FROM public."group" g
    WHERE g.group_id = $1
    `,
    [groupId]
  );

  if (groupResult.rows.length === 0) {
    return null;
  }

  const payoutCycleResult = await client.query(
    `
    SELECT
      pc.payout_cycle_id,
      pc.group_id,
      pc.frequency,
      pc.contribution_amount,
      pc.status,
      pc.current_recipient_membership_id,
      current_membership.member_id AS current_recipient_member_id,
      current_member.full_name AS current_recipient_full_name,
      current_member.email AS current_recipient_email
    FROM public.payout_cycle pc
    LEFT JOIN public.membership current_membership
      ON pc.current_recipient_membership_id = current_membership.membership_id
    LEFT JOIN public.member current_member
      ON current_membership.member_id = current_member.member_id
    WHERE pc.group_id = $1
    `,
    [groupId]
  );

  const membersResult = await client.query(
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
    [groupId]
  );

  return {
    group: mapRowToResponse(groupResult.rows[0], Group, groupToResponse),
    payout_cycle: payoutCycleRowToResponse(payoutCycleResult.rows[0]),
    members: membersResult.rows.map(membershipRowToResponse),
  };
};

export const createGroup = async (req, res) => {
  const {
    group_name,
    start_cycle_date,
    notes,
    frequency,
    contribution_amount,
  } = req.body;

  if (isBlank(group_name) || isBlank(start_cycle_date)) {
    return res.status(400).json({
      error: "group_name and start_cycle_date are required",
    });
  }

  if (!isValidNonNegativeNumber(contribution_amount)) {
    return res.status(400).json({
      error: "contribution_amount is required and must be 0 or greater",
    });
  }

  const normalizedFrequency = normalizeFrequency(frequency);

  if (!normalizedFrequency) {
    return res.status(400).json({
      error: "frequency is required and must be Weekly or Monthly",
    });
  }

  const firebaseUid = req.user?.uid;

  try {
    const response = await runInTransaction(async (client) => {
      const memberResult = await client.query(
        `
        SELECT member_id, full_name, email
        FROM public.member
        WHERE firebase_uid = $1
        `,
        [firebaseUid]
      );

      if (memberResult.rows.length === 0) {
        throw new AppError(404, {
          error: "Authenticated member not found",
        });
      }

      const creator = memberResult.rows[0];
      const inviteCode = await createUniqueInviteCode(client);

      const groupResult = await client.query(
        `
        INSERT INTO public."group" (
          group_name,
          start_cycle_date,
          notes,
          invite_code
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          group_id,
          group_name,
          start_cycle_date,
          notes,
          invite_code,
          created_at
        `,
        [
          String(group_name).trim(),
          start_cycle_date,
          toNullableText(notes) ?? null,
          inviteCode,
        ]
      );

      const createdGroup = Group.fromDatabase(groupResult.rows[0]);

      await client.query(
        `
        INSERT INTO public.payout_cycle (
          group_id,
          frequency,
          contribution_amount
        )
        VALUES ($1, $2, $3)
        RETURNING
          payout_cycle_id,
          group_id,
          frequency,
          contribution_amount,
          status,
          current_recipient_membership_id
        `,
        [createdGroup.getGroupId(), normalizedFrequency, contribution_amount]
      );

      const membershipResult = await client.query(
        `
        INSERT INTO public.membership (
          member_id,
          group_id,
          role,
          status
        )
        VALUES ($1, $2, 'ADMIN', 'APPROVED')
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
        [creator.member_id, createdGroup.getGroupId()]
      );

      const details = await getGroupDetails(client, createdGroup.getGroupId());

      return {
        message: "Group created successfully",
        ...details,
        creator_membership: membershipRowToResponse({
          ...membershipResult.rows[0],
          full_name: creator.full_name,
          email: creator.email,
        }),
      };
    });

    return res.status(201).json(response);
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Error creating group:",
      groupErrorMessages
    );
  }
};

export const getGroupById = async (req, res) => {
  const { id } = req.params;
  let client;

  try {
    client = await pool.connect();

    const details = await getGroupDetails(client, id);

    if (!details) {
      return res.status(404).json({ error: "Group not found" });
    }

    return res.json(details);
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Error fetching group by id:",
      groupErrorMessages
    );
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const getGroupByInviteCode = async (req, res) => {
  const { invite_code } = req.params;
  let client;

  try {
    client = await pool.connect();

    const groupResult = await client.query(
      `
      SELECT group_id
      FROM public."group"
      WHERE invite_code = $1
      `,
      [String(invite_code).trim().toUpperCase()]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: "Invalid invite code" });
    }

    const details = await getGroupDetails(client, groupResult.rows[0].group_id);

    return res.json(details);
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Error fetching group by invite code:",
      groupErrorMessages
    );
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const getMembersByGroupId = async (req, res) => {
  const { id } = req.params;
  let client;

  try {
    client = await pool.connect();

    const details = await getGroupDetails(client, id);

    if (!details) {
      return res.status(404).json({ error: "Group not found" });
    }

    return res.json(details.members);
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Error fetching group members:",
      groupErrorMessages
    );
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const updateGroup = async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  try {
    const response = await runInTransaction(async (client) => {
      const currentGroupResult = await client.query(
        `
        SELECT
          group_id,
          group_name,
          start_cycle_date,
          notes,
          invite_code,
          created_at
        FROM public."group"
        WHERE group_id = $1
        `,
        [id]
      );

      if (currentGroupResult.rows.length === 0) {
        throw new AppError(404, { error: "Group not found" });
      }

      const currentGroup = Group.fromDatabase(currentGroupResult.rows[0]);

      if (hasOwn(body, "group_name") && isBlank(body.group_name)) {
        throw new AppError(400, { error: "group_name cannot be blank" });
      }

      if (hasOwn(body, "start_cycle_date") && isBlank(body.start_cycle_date)) {
        throw new AppError(400, {
          error: "start_cycle_date cannot be blank",
        });
      }

      const normalizedFrequency = hasOwn(body, "frequency")
        ? normalizeFrequency(body.frequency)
        : undefined;

      if (hasOwn(body, "frequency") && !normalizedFrequency) {
        throw new AppError(400, {
          error: "frequency must be Weekly or Monthly",
        });
      }

      const normalizedStatus = hasOwn(body, "payout_cycle_status")
        ? normalizeCycleStatus(body.payout_cycle_status)
        : undefined;

      if (hasOwn(body, "payout_cycle_status") && !normalizedStatus) {
        throw new AppError(400, {
          error: "payout_cycle_status must be ACTIVE, PAUSED, or COMPLETED",
        });
      }

      if (
        hasOwn(body, "contribution_amount") &&
        !isValidNonNegativeNumber(body.contribution_amount)
      ) {
        throw new AppError(400, {
          error: "contribution_amount must be 0 or greater",
        });
      }

      if (
        hasOwn(body, "current_recipient_membership_id") &&
        body.current_recipient_membership_id !== null
      ) {
        const membershipCheck = await client.query(
          `
          SELECT membership_id
          FROM public.membership
          WHERE membership_id = $1 AND group_id = $2
          `,
          [body.current_recipient_membership_id, id]
        );

        if (membershipCheck.rows.length === 0) {
          throw new AppError(400, {
            error: "current_recipient_membership_id must belong to this group",
          });
        }
      }

      const updatedGroupResult = await client.query(
        `
        UPDATE public."group"
        SET
          group_name = $1,
          start_cycle_date = $2,
          notes = $3
        WHERE group_id = $4
        RETURNING
          group_id,
          group_name,
          start_cycle_date,
          notes,
          invite_code,
          created_at
        `,
        [
          hasOwn(body, "group_name")
            ? String(body.group_name).trim()
            : currentGroup.getGroupName(),
          hasOwn(body, "start_cycle_date")
            ? body.start_cycle_date
            : currentGroup.getStartCycleDate(),
          hasOwn(body, "notes")
            ? toNullableText(body.notes)
            : currentGroup.getNotes(),
          id,
        ]
      );

      const updatedGroup = Group.fromDatabase(updatedGroupResult.rows[0]);

      const currentCycleResult = await client.query(
        `
        SELECT
          payout_cycle_id,
          group_id,
          frequency,
          contribution_amount,
          status,
          current_recipient_membership_id
        FROM public.payout_cycle
        WHERE group_id = $1
        `,
        [id]
      );

      let updatedPayoutCycle = null;

      const wantsCycleUpdate =
        hasOwn(body, "frequency") ||
        hasOwn(body, "contribution_amount") ||
        hasOwn(body, "payout_cycle_status") ||
        hasOwn(body, "current_recipient_membership_id");

      if (currentCycleResult.rows.length > 0) {
        const currentCycle = PayoutCycle.fromDatabase(currentCycleResult.rows[0]);

        const updatedCycleResult = await client.query(
          `
          UPDATE public.payout_cycle
          SET
            frequency = $1,
            contribution_amount = $2,
            status = $3,
            current_recipient_membership_id = $4
          WHERE group_id = $5
          RETURNING
            payout_cycle_id,
            group_id,
            frequency,
            contribution_amount,
            status,
            current_recipient_membership_id
          `,
          [
            hasOwn(body, "frequency")
              ? normalizedFrequency
              : currentCycle.getFrequency(),
            hasOwn(body, "contribution_amount")
              ? body.contribution_amount
              : currentCycle.getContributionAmount(),
            hasOwn(body, "payout_cycle_status")
              ? normalizedStatus
              : currentCycle.getStatus(),
            hasOwn(body, "current_recipient_membership_id")
              ? body.current_recipient_membership_id
              : currentCycle.getCurrentRecipientMembershipId(),
            id,
          ]
        );

        updatedPayoutCycle = PayoutCycle.fromDatabase(
          updatedCycleResult.rows[0]
        );
      } else if (wantsCycleUpdate) {
        if (!hasOwn(body, "frequency") || !hasOwn(body, "contribution_amount")) {
          throw new AppError(400, {
            error:
              "This group does not have a payout_cycle yet. To create one during update, provide frequency and contribution_amount.",
          });
        }

        const insertedCycleResult = await client.query(
          `
          INSERT INTO public.payout_cycle (
            group_id,
            frequency,
            contribution_amount,
            status,
            current_recipient_membership_id
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING
            payout_cycle_id,
            group_id,
            frequency,
            contribution_amount,
            status,
            current_recipient_membership_id
          `,
          [
            id,
            normalizedFrequency,
            body.contribution_amount,
            normalizedStatus || "ACTIVE",
            hasOwn(body, "current_recipient_membership_id")
              ? body.current_recipient_membership_id
              : null,
          ]
        );

        updatedPayoutCycle = PayoutCycle.fromDatabase(
          insertedCycleResult.rows[0]
        );
      }

      const details = await getGroupDetails(client, id);

      return {
        message: "Group updated successfully",
        ...details,
        updated_group: groupToResponse(updatedGroup),
        updated_payout_cycle: updatedPayoutCycle
          ? payoutCycleToResponse(updatedPayoutCycle)
          : null,
      };
    });

    return res.json(response);
  } catch (err) {
    return sendDatabaseError(
      res,
      err,
      "Error updating group:",
      groupErrorMessages
    );
  }
};