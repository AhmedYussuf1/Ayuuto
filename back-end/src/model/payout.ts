import type { Id, ISODate, Money, PayoutStatus } from "./types";

export class Payout {
  private _payoutId: Id;
  private _membershipId: Id;
  private _amount: Money;
  private _payoutDate: ISODate;
  private _status: PayoutStatus;
  private _note: string | null;

  constructor(
    payoutId: Id,
    membershipId: Id,
    amount: Money,
    payoutDate: ISODate,
    status: PayoutStatus,
    note: string | null
  ) {
    this._payoutId = payoutId;
    this._membershipId = membershipId;
    this._amount = amount;
    this._payoutDate = payoutDate;
    this._status = status;
    this._note = note;
  }

  getPayoutId(): Id {
    return this._payoutId;
  }

  getMembershipId(): Id {
    return this._membershipId;
  }

  getAmount(): Money {
    return this._amount;
  }

  getPayoutDate(): ISODate {
    return this._payoutDate;
  }

  getStatus(): PayoutStatus {
    return this._status;
  }

  getNote(): string | null {
    return this._note;
  }

  static fromDatabase(row: {
    payout_id: Id;
    membership_id: Id;
    amount: Money;
    payout_date: ISODate;
    status: PayoutStatus;
    note: string | null;
  }): Payout {
    return new Payout(
      row.payout_id,
      row.membership_id,
      row.amount,
      row.payout_date,
      row.status,
      row.note
    );
  }
}