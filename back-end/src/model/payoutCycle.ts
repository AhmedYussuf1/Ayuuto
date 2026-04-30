import type {
  Id,
  Money,
  PayoutCycleFrequency,
  PayoutCycleStatus,
} from "./types";

export class PayoutCycle {
  private _payoutCycleId: Id;
  private _groupId: Id;
  private _frequency: PayoutCycleFrequency;
  private _contributionAmount: Money;
  private _status: PayoutCycleStatus;
  private _currentRecipientMembershipId: Id | null;

  constructor(
    payoutCycleId: Id,
    groupId: Id,
    frequency: PayoutCycleFrequency,
    contributionAmount: Money,
    status: PayoutCycleStatus,
    currentRecipientMembershipId: Id | null
  ) {
    this._payoutCycleId = payoutCycleId;
    this._groupId = groupId;
    this._frequency = frequency;
    this._contributionAmount = contributionAmount;
    this._status = status;
    this._currentRecipientMembershipId = currentRecipientMembershipId;
  }

  getPayoutCycleId(): Id {
    return this._payoutCycleId;
  }

  getGroupId(): Id {
    return this._groupId;
  }

  getFrequency(): PayoutCycleFrequency {
    return this._frequency;
  }

  getContributionAmount(): Money {
    return this._contributionAmount;
  }

  getStatus(): PayoutCycleStatus {
    return this._status;
  }

  getCurrentRecipientMembershipId(): Id | null {
    return this._currentRecipientMembershipId;
  }

  static fromDatabase(row: {
    payout_cycle_id: Id;
    group_id: Id;
    frequency: PayoutCycleFrequency;
    contribution_amount: Money;
    status: PayoutCycleStatus;
    current_recipient_membership_id: Id | null;
  }): PayoutCycle {
    return new PayoutCycle(
      row.payout_cycle_id,
      row.group_id,
      row.frequency,
      row.contribution_amount,
      row.status,
      row.current_recipient_membership_id
    );
  }
}