export type Id = string | number;
export type ISODate = string;
export type Money = string | number;

export type MembershipRole = "ADMIN" | "MEMBER";
export type MembershipStatus = "PENDING" | "APPROVED" | "REJECTED";

export type PayoutCycleStatus = "ACTIVE" | "PAUSED" | "COMPLETED";
export type PayoutCycleFrequency = "Weekly" | "Monthly";

export type ContributionStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type PayoutStatus = "PENDING" | "PAID" | "MISSED" | "CANCELED";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELED";