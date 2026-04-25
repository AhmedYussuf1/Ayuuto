import type {
  Id,
  Money,
  PayoutCycleFrequency,
  PayoutCycleStatus,
} from "./types";
import { Contribution } from "./contribution";

export class PayoutCycle {
  private _frequency: PayoutCycleFrequency;
  private _payoutId: Id | null;
  private _contribution: Contribution | null;
  private _amount: Money;
  private _payoutOrder: number | null;
  private _status: PayoutCycleStatus;

  constructor(
    frequency: PayoutCycleFrequency,
    payoutId: Id | null,
    contribution: Contribution | null,
    amount: Money,
    payoutOrder: number | null,
    status: PayoutCycleStatus
  ) {
    this._frequency = frequency;
    this._payoutId = payoutId;
    this._contribution = contribution;
    this._amount = amount;
    this._payoutOrder = payoutOrder;
    this._status = status;
  }

  getFrequency(): PayoutCycleFrequency {
    return this._frequency;
  }

  getPayoutId(): Id | null {
    return this._payoutId;
  }

  getContribution(): Contribution | null {
    return this._contribution;
  }

  getAmount(): Money {
    return this._amount;
  }

  getPayoutOrder(): number | null {
    return this._payoutOrder;
  }

  getStatus(): PayoutCycleStatus {
    return this._status;
  }
}