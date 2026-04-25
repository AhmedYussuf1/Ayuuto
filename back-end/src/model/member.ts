import type { Id } from "./types";

export class Member {
  private _memberId: Id;
  private _name: string;
  private _email: string;

  constructor(memberId: Id, name: string, email: string) {
    this._memberId = memberId;
    this._name = name;
    this._email = email;
  }

  getMemberId(): Id {
    return this._memberId;
  }

  getName(): string {
    return this._name;
  }

  getMemberName(): string {
    return this._name;
  }

  getEmail(): string {
    return this._email;
  }
}