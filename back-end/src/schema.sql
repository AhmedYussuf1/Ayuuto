-- =========================
-- Ayuuto PostgreSQL Schema (Improved)
-- =========================

CREATE EXTENSION IF NOT EXISTS citext;

-- -------------------------
-- MEMBER
-- -------------------------
CREATE TABLE member (
  member_id  BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      CITEXT NOT NULL UNIQUE
);

-- -------------------------
-- GROUP
-- -------------------------
CREATE TABLE "group" (
  group_id         BIGSERIAL PRIMARY KEY,
  group_name       TEXT NOT NULL,
  start_cycle_date DATE NOT NULL
);

-- -------------------------
-- MEMBERSHIP (Member <-> Group)
-- -------------------------
CREATE TABLE membership (
  membership_id   BIGSERIAL PRIMARY KEY,
  member_id       BIGINT NOT NULL REFERENCES member(member_id) ON DELETE CASCADE,
  group_id        BIGINT NOT NULL REFERENCES "group"(group_id) ON DELETE CASCADE,

  role            TEXT NOT NULL DEFAULT 'MEMBER'
                  CHECK (role IN ('ADMIN','MEMBER')),

  payout_position INTEGER,
  joined_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  left_date       DATE,

  CONSTRAINT uq_membership_member_group UNIQUE (member_id, group_id),
  CONSTRAINT chk_membership_dates CHECK (left_date IS NULL OR left_date >= joined_date),
  CONSTRAINT chk_payout_position_pos CHECK (payout_position IS NULL OR payout_position > 0)
);

CREATE INDEX idx_membership_group  ON membership(group_id);
CREATE INDEX idx_membership_member ON membership(member_id);

-- Enforce unique payout positions per active group members
CREATE UNIQUE INDEX uq_active_payout_position_per_group
ON membership(group_id, payout_position)
WHERE payout_position IS NOT NULL AND left_date IS NULL;

-- -------------------------
-- PAYOUT CYCLE (settings per group)
-- frequency: store as an integer (ex: 7 for weekly, 30 for monthly) OR define meaning in app
-- -------------------------
CREATE TABLE payout_cycle (
  payout_cycle_id     BIGSERIAL PRIMARY KEY,
  group_id            BIGINT NOT NULL REFERENCES "group"(group_id) ON DELETE CASCADE,

  frequency           INTEGER NOT NULL CHECK (frequency > 0),
  contribution_amount NUMERIC(12,2) NOT NULL CHECK (contribution_amount >= 0),

  status              TEXT NOT NULL DEFAULT 'ACTIVE'
                      CHECK (status IN ('ACTIVE','PAUSED','COMPLETED')),

  current_recipient_membership_id BIGINT
      REFERENCES membership(membership_id) ON DELETE SET NULL
);

CREATE INDEX idx_payout_cycle_group ON payout_cycle(group_id);

-- Optional: ensure only one ACTIVE cycle per group
CREATE UNIQUE INDEX uq_one_active_cycle_per_group
ON payout_cycle(group_id)
WHERE status = 'ACTIVE';

-- -------------------------
-- CONTRIBUTION (who paid, when, amount)
-- Uses membership_id to guarantee the payer belongs to the group.
-- -------------------------
CREATE TABLE contribution (
  contribution_id   BIGSERIAL PRIMARY KEY,
  membership_id     BIGINT NOT NULL REFERENCES membership(membership_id) ON DELETE CASCADE,

  amount            NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  contribution_date DATE NOT NULL,

  status            TEXT NOT NULL DEFAULT 'RECEIVED'
                    CHECK (status IN ('PENDING','RECEIVED','FAILED','REFUNDED'))
);

CREATE INDEX idx_contribution_membership_date
ON contribution(membership_id, contribution_date);

-- Optional: prevent duplicates (same member paying twice same day)
CREATE UNIQUE INDEX uq_contribution_once_per_day
ON contribution(membership_id, contribution_date);

-- -------------------------
-- PAYOUT (who got paid, when, amount)
-- Uses membership_id to guarantee the payee belongs to the group.
-- group_id included for easy filtering/reporting.
-- -------------------------
CREATE TABLE payout (
  payout_id      BIGSERIAL PRIMARY KEY,
  group_id       BIGINT NOT NULL REFERENCES "group"(group_id) ON DELETE CASCADE,
  pay_to_membership_id BIGINT NOT NULL REFERENCES membership(membership_id) ON DELETE RESTRICT,

  amount         NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  payout_date    DATE NOT NULL,

  status         TEXT NOT NULL DEFAULT 'SCHEDULED'
                 CHECK (status IN ('SCHEDULED','PAID','MISSED','CANCELED'))
);

CREATE INDEX idx_payout_group_date ON payout(group_id, payout_date);
CREATE INDEX idx_payout_payee      ON payout(pay_to_membership_id);

-- Optional: only one payout per group per payout_date
CREATE UNIQUE INDEX uq_payout_group_date
ON payout(group_id, payout_date);

-- -------------------------
-- INVITATION
-- -------------------------
CREATE TABLE invitation (
  invitation_id      BIGSERIAL PRIMARY KEY,
  group_id           BIGINT NOT NULL REFERENCES "group"(group_id) ON DELETE CASCADE,
  inviter_member_id  BIGINT NOT NULL REFERENCES member(member_id) ON DELETE RESTRICT,

  invitee_email      CITEXT NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at        TIMESTAMPTZ,
  expiration_at      TIMESTAMPTZ NOT NULL,

  status             TEXT NOT NULL DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING','ACCEPTED','EXPIRED','CANCELED')),

  CONSTRAINT chk_invitation_expiration CHECK (expiration_at > created_at)
);

CREATE INDEX idx_invitation_group  ON invitation(group_id);
CREATE INDEX idx_invitation_invitee ON invitation(invitee_email);

-- Only one pending invite per group + email
CREATE UNIQUE INDEX uq_invitation_pending_per_group_email
ON invitation(group_id, invitee_email)
WHERE status = 'PENDING';