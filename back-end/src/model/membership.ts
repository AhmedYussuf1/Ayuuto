import type { Id, ISODate, MembershipRole } from "./types";
import { Member } from "./member";
import { Group } from "./group";

export class Membership {
  private _membershipId: Id;
  private _member: Member;
  private _group: Group;
  private _role: MembershipRole;
  private _payoutPosition: number | null;
  private _joinedDate: ISODate;
  private _leftDate: ISODate | null;

  constructor(
    membershipId: Id,
    member: Member,
    group: Group,
    role: MembershipRole,
    payoutPosition: number | null,
    joinedDate: ISODate,
    leftDate: ISODate | null = null
  ) {
    this._membershipId = membershipId;
    this._member = member;
    this._group = group;
    this._role = role;
    this._payoutPosition = payoutPosition;
    this._joinedDate = joinedDate;
    this._leftDate = leftDate;
  }

  getMembershipId(): Id {
    return this._membershipId;
  }

  getMembershipID(): Id {
    return this._membershipId;
  }

  getRole(): MembershipRole {
    return this._role;
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

  getGroupId(): Id {
    return this._group.getGroupId();
  }

  getGroupName(): string {
    return this._group.getGroupName();
  }

  getStartCycleDate(): ISODate {
    return this._group.getStartCycleDate();
  }

  getMembers(): Member[] {
    return this._group.getMembers();
  }

  getMemberId(): Id {
    return this._member.getMemberId();
  }

  getMemberName(): string {
    return this._member.getMemberName();
  }

  getMember(): Member {
    return this._member;
  }

  getGroup(): Group {
    return this._group;
  }
}