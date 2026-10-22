-- ============================================================
-- Koto Education - Facturas
-- ============================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard

-- NIF/DNI del cliente (para facturas completas)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS nif text;

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  year smallint NOT NULL,
  seq integer NOT NULL,
  number text NOT NULL UNIQUE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  -- Copia de los datos del cliente en el momento de emitir la factura
  client_name text NOT NULL,
  client_nif text,
  client_address text,
  -- [{ "description": text, "quantity": number, "unit_price": number (sin IVA) }]
  items jsonb NOT NULL DEFAULT '[]',
  vat_rate numeric(5,2) NOT NULL DEFAULT 21,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  vat_amount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at date,
  payment_method text CHECK (payment_method IN ('cash', 'transfer', 'card')),
  income_id uuid REFERENCES income(id) ON DELETE SET NULL,
  notes text,
  UNIQUE (year, seq)
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access - invoices" ON invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
