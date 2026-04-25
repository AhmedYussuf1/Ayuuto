import type { Id, ISODate } from "./types";
import type { Member } from "./member";
import type { Group } from "./group";


export class Invitation {
  private _invitationId: Id;
  private _inviter: Member | null;
  private _group: Group;
  private _acceptedDate: ISODate | null;
  private _expirationDate: ISODate | null;
  private _inviteeEmail: string;

  constructor(
    invitationId: Id,
    inviter: Member | null,
    group: Group,
    acceptedDate: ISODate | null,
    expirationDate: ISODate | null,
    inviteeEmail: string
  ) {
    this._invitationId = invitationId;
    this._inviter = inviter;
    this._group = group;
    this._acceptedDate = acceptedDate;
    this._expirationDate = expirationDate;
    this._inviteeEmail = inviteeEmail;
  }

  getInvitationId(): Id {
    return this._invitationId;
  }

  getInviter(): Member | null {
    return this._inviter;
  }

  getGroup(): Group {
    return this._group;
  }

  getAcceptedDate(): ISODate | null {
    return this._acceptedDate;
  }

  getExpirationDate(): ISODate | null {
    return this._expirationDate;
  }

  getInviteeEmail(): string {
    return this._inviteeEmail;
  }
}