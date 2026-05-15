CREATE TYPE entry_type AS ENUM (
  'CREDIT_ISSUED',
  'CREDIT_DEDUCTED',
  'CREDIT_REPAID',
  'CREDIT_DEFAULTED'
);

CREATE TYPE account_type AS ENUM (
  'POOL',
  'AGENT',
  'BAD_DEBT'
);

CREATE TYPE entry_status AS ENUM (
  'PENDING',
  'CONFIRMED'
);

CREATE TABLE ledger_entries (
  id              UUID           NOT NULL DEFAULT gen_random_uuid(),
  entry_type      entry_type     NOT NULL,
  agent_address   VARCHAR(42),
  debit_account   account_type   NOT NULL,
  credit_account  account_type   NOT NULL,
  amount_wei      NUMERIC(78, 0) NOT NULL,
  tx_hash         VARCHAR(66),
  block_number    BIGINT,
  status          entry_status   NOT NULL DEFAULT 'PENDING',
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT ledger_entries_pkey
    PRIMARY KEY (id),

  CONSTRAINT amount_must_be_positive
    CHECK (amount_wei > 0),

  CONSTRAINT debit_credit_must_differ
    CHECK (debit_account <> credit_account),

  CONSTRAINT agent_address_required_for_agent_ops
    CHECK (
      (debit_account = 'AGENT' OR credit_account = 'AGENT')
        IS FALSE
      OR agent_address IS NOT NULL
    ),

  CONSTRAINT tx_hash_valid_format
    CHECK (tx_hash IS NULL OR tx_hash ~ '^0x[0-9a-fA-F]{64}$'),

  CONSTRAINT agent_address_valid_format
    CHECK (agent_address IS NULL OR agent_address ~ '^0x[0-9a-fA-F]{40}$')
);

CREATE INDEX idx_ledger_agent_address
  ON ledger_entries (agent_address, created_at DESC)
  WHERE agent_address IS NOT NULL;

CREATE INDEX idx_ledger_entry_type
  ON ledger_entries (entry_type, created_at DESC);

CREATE UNIQUE INDEX idx_ledger_tx_hash_unique
  ON ledger_entries (tx_hash)
  WHERE tx_hash IS NOT NULL;

CREATE INDEX idx_ledger_pending_status
  ON ledger_entries (status, created_at)
  WHERE status = 'PENDING';

CREATE VIEW agent_balances AS
SELECT
  agent_address,

  COALESCE(
    SUM(amount_wei) FILTER (WHERE entry_type = 'CREDIT_DEDUCTED'), 0
  )
  -
  COALESCE(
    SUM(amount_wei) FILTER (WHERE entry_type IN ('CREDIT_REPAID', 'CREDIT_DEFAULTED')), 0
  ) AS outstanding_wei,

  COALESCE(
    SUM(amount_wei) FILTER (WHERE entry_type = 'CREDIT_DEDUCTED'), 0
  ) AS total_borrowed_wei,

  COALESCE(
    SUM(amount_wei) FILTER (WHERE entry_type = 'CREDIT_REPAID'), 0
  ) AS total_repaid_wei,

  COUNT(*) FILTER (WHERE entry_type = 'CREDIT_DEFAULTED') AS default_count,

  MAX(created_at) AS last_activity_at

FROM ledger_entries
WHERE agent_address IS NOT NULL
GROUP BY agent_address;

CREATE VIEW pool_balance AS
SELECT

  COALESCE(SUM(amount_wei) FILTER (WHERE entry_type = 'CREDIT_ISSUED'),   0)
  -
  COALESCE(SUM(amount_wei) FILTER (WHERE entry_type = 'CREDIT_DEDUCTED'), 0)
  +
  COALESCE(SUM(amount_wei) FILTER (WHERE entry_type = 'CREDIT_REPAID'),   0)
  AS available_wei,

  COALESCE(SUM(amount_wei) FILTER (WHERE entry_type = 'CREDIT_ISSUED'), 0)
  AS total_funded_wei,

  COALESCE(SUM(amount_wei) FILTER (WHERE entry_type = 'CREDIT_DEDUCTED'), 0)
  -
  COALESCE(SUM(amount_wei) FILTER (WHERE entry_type IN ('CREDIT_REPAID', 'CREDIT_DEFAULTED')), 0)
  AS total_lent_wei,

  COALESCE(SUM(amount_wei) FILTER (WHERE entry_type = 'CREDIT_DEFAULTED'), 0)
  AS total_bad_debt_wei

FROM ledger_entries;