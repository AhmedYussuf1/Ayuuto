import type { Id, ISODate } from "./types";
 import type { Member } from "./member";
export class Group {
  private _groupId: Id;
  private _groupName: string;
  private _startCycleDate: ISODate;
  private _members: Member[];

  constructor(
    groupId: Id,
    groupName: string,
    startCycleDate: ISODate,
    members: Member[] = []
  ) {
    this._groupId = groupId;
    this._groupName = groupName;
    this._startCycleDate = startCycleDate;
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

  getMembers(): Member[] {
    return this._members;
  }
}