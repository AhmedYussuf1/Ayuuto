import type { Id, ISODate, MembershipRole, MembershipStatus } from "./types";

export class Membership {
  private _membershipId: Id;
  private _memberId: Id;
  private _groupId: Id;
  private _role: MembershipRole;
  private _status: MembershipStatus;
  private _payoutPosition: number | null;
  private _joinedDate: ISODate;
  private _leftDate: ISODate | null;

  constructor(
    membershipId: Id,
    memberId: Id,
    groupId: Id,
    role: MembershipRole,
    status: MembershipStatus,
    payoutPosition: number | null,
    joinedDate: ISODate,
    leftDate: ISODate | null
  ) {
    this._membershipId = membershipId;
    this._memberId = memberId;
    this._groupId = groupId;
    this._role = role;
    this._status = status;
    this._payoutPosition = payoutPosition;
    this._joinedDate = joinedDate;
    this._leftDate = leftDate;
  }

  getMembershipId(): Id {
    return this._membershipId;
  }

  getMemberId(): Id {
    return this._memberId;
  }

  getGroupId(): Id {
    return this._groupId;
  }

  getRole(): MembershipRole {
    return this._role;
  }

  getStatus(): MembershipStatus {
    return this._status;
  }

  getPayoutPosition(): number | null {
    return this._payoutPosition;
  }

  getJoinedDate(): ISODate {
    return this._joinedDate;
  }

  getLeftDate(): ISODate | null {
    return this._leftDate;
  }

  static fromDatabase(row: {
    membership_id: Id;
    member_id: Id;
    group_id: Id;
    role: MembershipRole;
    status?: MembershipStatus | null;
    payout_position: number | null;
    joined_date: ISODate;
    left_date: ISODate | null;
  }): Membership {
    return new Membership(
      row.membership_id,
      row.member_id,
      row.group_id,
      row.role,
      row.status ?? "PENDING",
      row.payout_position,
      row.joined_date,
      row.left_date
    );
  }
}