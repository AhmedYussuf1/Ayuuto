import type { Id, ISODate, Money } from "./types";

export class Contribution {
  private _contributionId: Id;
  private _contributionDate: ISODate;
  private _amount: Money;

  constructor(contributionId: Id, contributionDate: ISODate, amount: Money) {
    this._contributionId = contributionId;
    this._contributionDate = contributionDate;
    this._amount = amount;
  }

  getContributionId(): Id {
    return this._contributionId;
  }

  getContributionDate(): ISODate {
    return this._contributionDate;
  }

  getAmount(): Money {
    return this._amount;
  }
}