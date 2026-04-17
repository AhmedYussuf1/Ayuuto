CREATE EXTENSION IF NOT EXISTS citext;

DROP TABLE IF EXISTS invitation CASCADE;
DROP TABLE IF EXISTS payout CASCADE;
DROP TABLE IF EXISTS contribution CASCADE;
DROP TABLE IF EXISTS payout_cycle CASCADE;
DROP TABLE IF EXISTS membership CASCADE;
DROP TABLE IF EXISTS public."group" CASCADE;
DROP TABLE IF EXISTS member CASCADE;

CREATE TABLE member (
  member_id     BIGSERIAL PRIMARY KEY,
  full_name     TEXT NOT NULL,
  email         CITEXT NOT NULL UNIQUE,
  firebase_uid  TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public."group" (
  group_id         BIGSERIAL PRIMARY KEY,
  group_name       TEXT NOT NULL,
  start_cycle_date DATE NOT NULL,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE membership (
  membership_id   BIGSERIAL PRIMARY KEY,
  member_id       BIGINT NOT NULL REFERENCES member(member_id) ON DELETE CASCADE,
  group_id        BIGINT NOT NULL REFERENCES public."group"(group_id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'MEMBER'
                  CHECK (role IN ('ADMIN', 'MEMBER')),
  payout_position INTEGER,
  joined_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  left_date       DATE,
  CONSTRAINT uq_membership_member_group UNIQUE (member_id, group_id),
  CONSTRAINT chk_membership_dates
    CHECK (left_date IS NULL OR left_date >= joined_date),
  CONSTRAINT chk_payout_position_pos
    CHECK (payout_position IS NULL OR payout_position > 0)
);

CREATE INDEX idx_membership_group ON membership(group_id);
CREATE INDEX idx_membership_member ON membership(member_id);

CREATE UNIQUE INDEX uq_active_payout_position_per_group
ON membership(group_id, payout_position)
WHERE payout_position IS NOT NULL AND left_date IS NULL;

CREATE TABLE payout_cycle (
  payout_cycle_id                 BIGSERIAL PRIMARY KEY,
  group_id                        BIGINT NOT NULL REFERENCES public."group"(group_id) ON DELETE CASCADE,
  frequency                       TEXT NOT NULL
                                  CHECK (frequency IN ('Weekly', 'Monthly')),
  contribution_amount             NUMERIC(12,2) NOT NULL
                                  CHECK (contribution_amount >= 0),
  status                          TEXT NOT NULL DEFAULT 'ACTIVE'
                                  CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED')),
  current_recipient_membership_id BIGINT
                                  REFERENCES membership(membership_id) ON DELETE SET NULL,
  CONSTRAINT uq_payout_cycle_group UNIQUE (group_id)
);

CREATE INDEX idx_payout_cycle_group ON payout_cycle(group_id);

CREATE TABLE contribution (
  contribution_id   BIGSERIAL PRIMARY KEY,
  membership_id     BIGINT NOT NULL REFERENCES membership(membership_id) ON DELETE CASCADE,
  amount            NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status            TEXT NOT NULL DEFAULT 'PAID'
                    CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  note              TEXT
);

CREATE INDEX idx_contribution_membership_date
ON contribution(membership_id, contribution_date);

CREATE UNIQUE INDEX uq_contribution_once_per_day
ON contribution(membership_id, contribution_date);

CREATE TABLE payout (
  payout_id        BIGSERIAL PRIMARY KEY,
  membership_id    BIGINT NOT NULL REFERENCES membership(membership_id) ON DELETE RESTRICT,
  amount           NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  payout_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  status           TEXT NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING', 'PAID', 'MISSED', 'CANCELED')),
  note             TEXT
);

CREATE INDEX idx_payout_membership_date
ON payout(membership_id, payout_date);

CREATE TABLE invitation (
  invitation_id   BIGSERIAL PRIMARY KEY,
  group_id        BIGINT NOT NULL REFERENCES public."group"(group_id) ON DELETE CASCADE,
  email           CITEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELED')),
  invited_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitation_group ON invitation(group_id);
CREATE INDEX idx_invitation_email ON invitation(email);

CREATE UNIQUE INDEX uq_invitation_pending_per_group_email
ON invitation(group_id, email)
WHERE status = 'PENDING';