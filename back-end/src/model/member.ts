import type { Id } from "./types";

type MemberRow = {
  member_id: Id;
  full_name: string;
  email: string;
};

export class Member {
  private _memberId: Id;
  private _name: string;
  private _email: string;

  constructor(memberId: Id, name: string, email: string) {
    this._memberId = memberId;
    this._name = name;
    this._email = email;
  }

  static fromRow(row: MemberRow): Member {
    return new Member(row.member_id, row.full_name, row.email);
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

  toJSON() {
    return {
      member_id: this._memberId,
      full_name: this._name,
      email: this._email,
    };
  }
}