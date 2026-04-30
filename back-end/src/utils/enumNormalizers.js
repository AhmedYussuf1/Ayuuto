const normalizeEnum = (value, allowedValues) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || String(value).trim() === "") {
    return null;
  }

  const normalized = String(value).trim().toUpperCase();

  return allowedValues.includes(normalized) ? normalized : null;
};

export const normalizeRole = (role) =>
  normalizeEnum(role, ["ADMIN", "MEMBER"]);

export const normalizeContributionStatus = (status) =>
  normalizeEnum(status, ["PENDING", "PAID", "FAILED", "REFUNDED"]);

export const normalizePayoutStatus = (status) =>
  normalizeEnum(status, ["PENDING", "PAID", "MISSED", "CANCELED"]);

export const normalizeInvitationStatus = (status) =>
  normalizeEnum(status, ["PENDING", "ACCEPTED", "EXPIRED", "CANCELED"]);

export const normalizeCycleStatus = (status) =>
  normalizeEnum(status, ["ACTIVE", "PAUSED", "COMPLETED"]);

export const normalizeMembershipStatus = (status) =>
  normalizeEnum(status, ["PENDING", "APPROVED", "REJECTED"]);

export const normalizeFrequency = (frequency) => {
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