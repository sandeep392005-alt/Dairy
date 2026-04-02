BEGIN;

ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) NOT NULL DEFAULT 'google',
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

ALTER TABLE customers
  ALTER COLUMN phone_number DROP NOT NULL,
  ALTER COLUMN delivery_address DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customers_auth_provider_check'
  ) THEN
    ALTER TABLE customers
      ADD CONSTRAINT customers_auth_provider_check
      CHECK (auth_provider IN ('google', 'local'));
  END IF;
END $$;

-- Apply uniqueness and non-null expectations for auth flow.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customers_email_unique'
  ) THEN
    ALTER TABLE customers
      ADD CONSTRAINT customers_email_unique UNIQUE (email);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customers_google_id_unique'
  ) THEN
    ALTER TABLE customers
      ADD CONSTRAINT customers_google_id_unique UNIQUE (google_id);
  END IF;
END $$;

ALTER TABLE customers
  ALTER COLUMN email SET NOT NULL;

COMMIT;
