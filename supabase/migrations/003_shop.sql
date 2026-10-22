-- ============================================================
-- Koto Education - Tienda online
-- ============================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard

-- Products (handmade to order: price is final, IVA included)
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price numeric(8,2) NOT NULL DEFAULT 0,
  colors text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  -- When set, the customer must fill this field (e.g. "Contorno del cuello (cm)")
  measurement_label text,
  engraving_label text,
  production_days smallint NOT NULL DEFAULT 7,
  active boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO products (slug, name, description, measurement_label, engraving_label, sort_order) VALUES
  ('collar', 'Collar', 'Collar hecho a mano a la medida de tu perro.', 'Contorno del cuello (cm)', NULL, 1),
  ('correa', 'Correa', 'Correa hecha a mano, a juego con el collar.', 'Largo de la correa (cm)', NULL, 2),
  ('chapa-identificativa', 'Chapa identificativa', 'Chapa grabada con el nombre de tu perro y tu teléfono.', NULL, 'Texto a grabar (nombre y teléfono)', 3)
ON CONFLICT (slug) DO NOTHING;

-- Shop settings (single row)
CREATE TABLE IF NOT EXISTS shop_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled boolean NOT NULL DEFAULT false,
  shipping_price numeric(8,2) NOT NULL DEFAULT 0,
  free_shipping_from numeric(8,2)
);

INSERT INTO shop_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  number integer GENERATED ALWAYS AS IDENTITY (START WITH 1001) UNIQUE,
  status text NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment', 'paid', 'in_production', 'shipped', 'delivered', 'cancelled')),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  address text NOT NULL,
  postal_code text NOT NULL,
  city text NOT NULL,
  province text NOT NULL,
  notes text,
  -- [{ product_id, name, color, measurement, engraving, quantity, unit_price (IVA incl.) }]
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  shipping numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  stripe_session_id text,
  paid_at timestamptz,
  tracking_number text,
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  income_id uuid REFERENCES income(id) ON DELETE SET NULL
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access - products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access - shop_settings" ON shop_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access - orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public can read active products" ON products FOR SELECT TO anon USING (active = true);
CREATE POLICY "Public can read shop settings" ON shop_settings FOR SELECT TO anon USING (true);
-- Orders are created and updated only from the server (service role), never from the browser
