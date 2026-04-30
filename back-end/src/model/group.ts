import type { Id, ISODate } from "./types";
import type { Member } from "./member";

export class Group {
  private _groupId: Id;
  private _groupName: string;
  private _startCycleDate: ISODate;
  private _notes: string | null;
  private _inviteCode: string | null;
  private _createdAt: ISODate | null;
  private _members: Member[];

  constructor(
    groupId: Id,
    groupName: string,
    startCycleDate: ISODate,
    notes: string | null = null,
    inviteCode: string | null = null,
    createdAt: ISODate | null = null,
    members: Member[] = []
  ) {
    this._groupId = groupId;
    this._groupName = groupName;
    this._startCycleDate = startCycleDate;
    this._notes = notes;
    this._inviteCode = inviteCode;
    this._createdAt = createdAt;
    this._members = members;
  }

  getGroupId(): Id {
    return this._groupId;
  }

  getGroupName(): string {
    return this._groupName;
  }

  getStartCycleDate(): ISODate {
    return this._startCycleDate;
  }

  getNotes(): string | null {
    return this._notes;
  }

  getInviteCode(): string | null {
    return this._inviteCode;
  }

  getCreatedAt(): ISODate | null {
    return this._createdAt;
  }

  getMembers(): Member[] {
    return this._members;
  }

  static fromDatabase(row: {
    group_id: Id;
    group_name: string;
    start_cycle_date: ISODate;
    notes: string | null;
    invite_code?: string | null;
    created_at?: ISODate | null;
  }): Group {
    return new Group(
      row.group_id,
      row.group_name,
      row.start_cycle_date,
      row.notes,
      row.invite_code ?? null,
      row.created_at ?? null
    );
  }
}