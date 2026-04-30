 import type { Id, ISODate, InvitationStatus } from "./types";

export class Invitation {
  private _invitationId: Id;
  private _groupId: Id;
  private _email: string;
  private _status: InvitationStatus;
  private _invitedAt: ISODate;

  constructor(
    invitationId: Id,
    groupId: Id,
    email: string,
    status: InvitationStatus,
    invitedAt: ISODate
  ) {
    this._invitationId = invitationId;
    this._groupId = groupId;
    this._email = email;
    this._status = status;
    this._invitedAt = invitedAt;
  }

  getInvitationId(): Id {
    return this._invitationId;
  }

  getGroupId(): Id {
    return this._groupId;
  }

  getEmail(): string {
    return this._email;
  }

  getStatus(): InvitationStatus {
    return this._status;
  }

  getInvitedAt(): ISODate {
    return this._invitedAt;
  }

  static fromDatabase(row: {
    invitation_id: Id;
    group_id: Id;
    email: string;
    status: InvitationStatus;
    invited_at: ISODate;
  }): Invitation {
    return new Invitation(
      row.invitation_id,
      row.group_id,
      row.email,
      row.status,
      row.invited_at
    );
  }
}