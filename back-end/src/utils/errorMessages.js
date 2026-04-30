export const memberErrorMessages = {
  unique: "This member conflicts with an existing record",
};

export const groupErrorMessages = {
  foreignKey: "A referenced record does not exist",
  unique: "This group data conflicts with an existing record",
};

export const membershipErrorMessages = {
  foreignKey: "member_id or group_id does not reference an existing record",
  uq_membership_member_group: "That member is already in this group",
  uq_active_payout_position_per_group:
    "That payout_position is already assigned to an active member in this group",
  unique: "This membership conflicts with an existing record",
};

export const contributionErrorMessages = {
  foreignKey: "membership_id does not reference an existing membership",
  unique: "Only one contribution per membership per day is allowed",
};

export const payoutErrorMessages = {
  foreignKey: "membership_id does not reference an existing membership",
};

export const invitationErrorMessages = {
  foreignKey: "group_id does not reference an existing group",
  unique: "A pending invitation already exists for this email in this group",
};