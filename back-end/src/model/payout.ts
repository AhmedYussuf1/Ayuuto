import type { Id, ISODate, Money } from "./types";
import  type { Member } from "./member";


export class Payout {
  private _payoutId: Id;
  private _payTo: Member;
  private _amount: Money;
  private _payoutDate: ISODate;

  constructor(
    payoutId: Id,
    payTo: Member,
    amount: Money,
    payoutDate: ISODate
  ) {
    this._payoutId = payoutId;
    this._payTo = payTo;
    this._amount = amount;
    this._payoutDate = payoutDate;
  }

  getPayoutId(): Id {
    return this._payoutId;
  }

  getPayTo(): Member {
    return this._payTo;
  }

  getAmount(): Money {
    return this._amount;
  }

  getPayoutDate(): ISODate {
    return this._payoutDate;
  }
}