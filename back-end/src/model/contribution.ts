import type { Id, ISODate, Money, ContributionStatus } from "./types";


export class Contribution {
  private _contributionId: Id;
  private _membershipId: Id;
  private _contributionDate: ISODate;
  private _amount: Money;
  private _status: ContributionStatus;
  private _note: string | null;

  constructor(
    contributionId: Id,
    membershipId: Id,
    contributionDate: ISODate,
    amount: Money,
    status: ContributionStatus,
    note: string | null
  ) {
    this._contributionId = contributionId;
    this._membershipId = membershipId;
    this._contributionDate = contributionDate;
    this._amount = amount;
    this._status = status;
    this._note = note;
  }

  getContributionId(): Id { return this._contributionId; }
  getMembershipId(): Id { return this._membershipId; }
  getContributionDate(): ISODate { return this._contributionDate; }
  getAmount(): Money { return this._amount; }
  getStatus(): ContributionStatus { return this._status; }
  getNote(): string | null { return this._note; }

  // Map DB row → Contribution object
  static fromDatabase(row: {
    contribution_id: Id;
    membership_id: Id;
    contribution_date: ISODate;
    amount: Money;
    status: ContributionStatus;
    note: string | null;
  }): Contribution {
    return new Contribution(
      row.contribution_id,
      row.membership_id,
      row.contribution_date,
      row.amount,
      row.status,
      row.note
    );
  }
}