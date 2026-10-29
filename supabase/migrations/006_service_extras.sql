-- ============================================================
-- Koto Education - Tarifas que son suplementos (extras)
-- ============================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
--
-- Extras (e.g. "Mascotas adicionales +10€") are shown as add-ons on the website
-- and do not count for the "desde X€" price of their category.

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS is_extra boolean NOT NULL DEFAULT false;

UPDATE public.services SET is_extra = true WHERE name = 'Mascotas adicionales';
