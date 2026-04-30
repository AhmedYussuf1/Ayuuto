import pool from "../dbConnection.js";

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const isBlank = (value) =>
  value === undefined || value === null || String(value).trim() === "";

const normalizeFrequency = (frequency) => {
  if (frequency === undefined) {
    return undefined;
  }

  if (frequency === null || String(frequency).trim() === "") {
    return null;
  }

  const normalized = String(frequency).trim().toLowerCase();

  if (["weekly", "7"].includes(normalized)) {
    return "Weekly";
  }

  if (["monthly", "30"].includes(normalized)) {
    return "Monthly";
  }

  return null;
};

const normalizeCycleStatus = (status) => {
  if (status === undefined) {
    return undefined;
  }

  if (status === null || String(status).trim() === "") {
    return null;
  }

  const normalized = String(status).trim().toUpperCase();
  return ["ACTIVE", "PAUSED", "COMPLETED"].includes(normalized)
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
      error: "A referenced record does not exist",
      detail: err.detail,
    });
  }

  if (err.code === "23505") {
    return res.status(409).json({
      error: "This group data conflicts with an existing record",
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

const getGroupDetails = async (client, groupId) => {
  const groupResult = await client.query(
    `
    SELECT
      g.group_id,
      g.group_name,
      g.start_cycle_date,
      g.notes,
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
    [groupId]
  );

  return {
    group: groupResult.rows[0],
    payout_cycle: payoutCycleResult.rows[0] || null,
    members: membersResult.rows,
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
  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const memberResult = await client.query(
      `
      SELECT member_id, full_name, email
      FROM public.member
      WHERE firebase_uid = $1
      `,
      [firebaseUid]
    );

    if (memberResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Authenticated member not found",
      });
    }

    const creator = memberResult.rows[0];

    const groupResult = await client.query(
      `
      INSERT INTO public."group" (group_name, start_cycle_date, notes)
      VALUES ($1, $2, $3)
      RETURNING group_id, group_name, start_cycle_date, notes, created_at
      `,
      [String(group_name).trim(), start_cycle_date, toNullableText(notes) ?? null]
    );

    const group = groupResult.rows[0];

    const payoutCycleResult = await client.query(
      `
      INSERT INTO public.payout_cycle (group_id, frequency, contribution_amount)
      VALUES ($1, $2, $3)
      RETURNING
        payout_cycle_id,
        group_id,
        frequency,
        contribution_amount,
        status,
        current_recipient_membership_id
      `,
      [group.group_id, normalizedFrequency, contribution_amount]
    );

    const membershipResult = await client.query(
      `
      INSERT INTO public.membership (member_id, group_id, role)
      VALUES ($1, $2, 'ADMIN')
      RETURNING
        membership_id,
        member_id,
        group_id,
        role,
        payout_position,
        joined_date,
        left_date
      `,
      [creator.member_id, group.group_id]
    );

    await client.query("COMMIT");

    const details = await getGroupDetails(client, group.group_id);

    return res.status(201).json({
      message: "Group created successfully",
      ...details,
      creator_membership: membershipResult.rows[0],
      payout_cycle: payoutCycleResult.rows[0],
    });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }

    return sendDatabaseError(res, err, "Error creating group:");
  } finally {
    if (client) {
      client.release();
    }
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
    return sendDatabaseError(res, err, "Error fetching group by id:");
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const getMembersByGroupId = async (req, res) => {
  const { id } = req.params;

  try {
    const groupCheck = await pool.query(
      `
      SELECT group_id
      FROM public."group"
      WHERE group_id = $1
      `,
      [id]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

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
    return sendDatabaseError(res, err, "Error fetching group members:");
  }
};

export const updateGroup = async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const currentGroupResult = await client.query(
      `
      SELECT group_id, group_name, start_cycle_date, notes, created_at
      FROM public."group"
      WHERE group_id = $1
      `,
      [id]
    );

    if (currentGroupResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Group not found" });
    }

    const currentGroup = currentGroupResult.rows[0];

    if (hasOwn(body, "group_name") && isBlank(body.group_name)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "group_name cannot be blank",
      });
    }

    const normalizedFrequency = hasOwn(body, "frequency")
      ? normalizeFrequency(body.frequency)
      : undefined;

    if (hasOwn(body, "frequency") && !normalizedFrequency) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "frequency must be Weekly or Monthly",
      });
    }

    const normalizedStatus = hasOwn(body, "payout_cycle_status")
      ? normalizeCycleStatus(body.payout_cycle_status)
      : undefined;

    if (hasOwn(body, "payout_cycle_status") && !normalizedStatus) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "payout_cycle_status must be ACTIVE, PAUSED, or COMPLETED",
      });
    }

    if (
      hasOwn(body, "contribution_amount") &&
      !isValidNonNegativeNumber(body.contribution_amount)
    ) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "contribution_amount must be 0 or greater",
      });
    }

    const updatedGroupResult = await client.query(
      `
      UPDATE public."group"
      SET
        group_name = $1,
        start_cycle_date = $2,
        notes = $3
      WHERE group_id = $4
      RETURNING group_id, group_name, start_cycle_date, notes, created_at
      `,
      [
        hasOwn(body, "group_name")
          ? String(body.group_name).trim()
          : currentGroup.group_name,
        hasOwn(body, "start_cycle_date")
          ? body.start_cycle_date
          : currentGroup.start_cycle_date,
        hasOwn(body, "notes") ? toNullableText(body.notes) : currentGroup.notes,
        id,
      ]
    );

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

    if (hasOwn(body, "current_recipient_membership_id") && body.current_recipient_membership_id !== null) {
      const membershipCheck = await client.query(
        `
        SELECT membership_id
        FROM public.membership
        WHERE membership_id = $1 AND group_id = $2
        `,
        [body.current_recipient_membership_id, id]
      );

      if (membershipCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "current_recipient_membership_id must belong to this group",
        });
      }
    }

    if (currentCycleResult.rows.length > 0) {
      const currentCycle = currentCycleResult.rows[0];

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
          hasOwn(body, "frequency") ? normalizedFrequency : currentCycle.frequency,
          hasOwn(body, "contribution_amount")
            ? body.contribution_amount
            : currentCycle.contribution_amount,
          hasOwn(body, "payout_cycle_status")
            ? normalizedStatus
            : currentCycle.status,
          hasOwn(body, "current_recipient_membership_id")
            ? body.current_recipient_membership_id
            : currentCycle.current_recipient_membership_id,
          id,
        ]
      );

      updatedPayoutCycle = updatedCycleResult.rows[0];
    } else if (wantsCycleUpdate) {
      if (!hasOwn(body, "frequency") || !hasOwn(body, "contribution_amount")) {
        await client.query("ROLLBACK");
        return res.status(400).json({
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

      updatedPayoutCycle = insertedCycleResult.rows[0];
    }

    await client.query("COMMIT");

    const details = await getGroupDetails(client, id);

    return res.json({
      message: "Group updated successfully",
      ...details,
      updated_group: updatedGroupResult.rows[0],
      updated_payout_cycle: updatedPayoutCycle,
    });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }

    return sendDatabaseError(res, err, "Error updating group:");
  } finally {
    if (client) {
      client.release();
    }
  }
};
