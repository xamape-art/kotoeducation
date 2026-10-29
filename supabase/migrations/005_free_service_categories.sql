-- ============================================================
-- Koto Education - Categorias de servicios libres
-- ============================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
--
-- Before: services.category only accepted 'walk', 'visit', 'care' and 'training'.
-- Now the admin panel can create services with any new category.

DO $$
DECLARE
  con record;
BEGIN
  FOR con IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.services'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%category%'
  LOOP
    EXECUTE format('ALTER TABLE public.services DROP CONSTRAINT %I', con.conname);
  END LOOP;
END $$;

-- Keep categories from being left empty
ALTER TABLE public.services
  ADD CONSTRAINT services_category_not_blank CHECK (btrim(category) <> '');
