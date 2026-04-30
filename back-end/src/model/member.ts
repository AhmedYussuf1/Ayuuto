 import type { Id, ISODate } from "./types";

export class Member {
  private _memberId: Id;
  private _fullName: string;
  private _email: string;
  private _firebaseUid: string | null;
  private _createdAt: ISODate | null;

  constructor(
    memberId: Id,
    fullName: string,
    email: string,
    firebaseUid: string | null = null,
    createdAt: ISODate | null = null
  ) {
    this._memberId = memberId;
    this._fullName = fullName;
    this._email = email;
    this._firebaseUid = firebaseUid;
    this._createdAt = createdAt;
  }

  getMemberId(): Id {
    return this._memberId;
  }

  getFullName(): string {
    return this._fullName;
  }

  getEmail(): string {
    return this._email;
  }

  getFirebaseUid(): string | null {
    return this._firebaseUid;
  }

  getCreatedAt(): ISODate | null {
    return this._createdAt;
  }

  static fromDatabase(row: {
    member_id: Id;
    full_name: string;
    email: string;
    firebase_uid?: string | null;
    created_at?: ISODate | null;
  }): Member {
    return new Member(
      row.member_id,
      row.full_name,
      row.email,
      row.firebase_uid ?? null,
      row.created_at ?? null
    );
  }
}