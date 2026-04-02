BEGIN;

-- Create enum safely for repeated runs.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'order_status_enum'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.order_status_enum AS ENUM (
      'Pending',
      'Out for Delivery',
      'Delivered'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  unit VARCHAR(20) NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS public.customers (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  auth_provider VARCHAR(20) NOT NULL DEFAULT 'google',
  google_id VARCHAR(255) UNIQUE,
  phone_number VARCHAR(20),
  delivery_address TEXT,
  CONSTRAINT customers_auth_provider_check
    CHECK (auth_provider IN ('google', 'local'))
);

CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  order_status public.order_status_enum NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id)
    REFERENCES public.customers (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_time_of_order NUMERIC(10, 2) NOT NULL CHECK (price_at_time_of_order >= 0),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id)
    REFERENCES public.orders (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id)
    REFERENCES public.products (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);

COMMIT;
