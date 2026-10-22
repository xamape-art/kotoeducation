-- ============================================================
-- Koto Education - Solo los administradores pueden acceder a los datos
-- ============================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
--
-- Before: any logged-in user had full access. Now only these two accounts do.
-- Keep in sync with ADMIN_USER_IDS in src/lib/admin.ts

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(auth.uid() IN (
    'ce3a16c5-f846-4a10-ad13-a8f60d613504'::uuid, -- kotoeducation@gmail.com
    'ef93623d-d6f0-44e4-a591-fe9287111dae'::uuid  -- xamape@gmail.com
  ), false)
$$;

-- Replace every policy for logged-in users on public tables with an admin-only one
DO $$
DECLARE
  pol record;
  tbl text;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND 'authenticated' = ANY (roles)
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;

  FOREACH tbl IN ARRAY ARRAY[
    'clients', 'pets', 'services', 'appointments', 'income', 'expenses', 'gallery_photos',
    'contact_requests', 'walk_reports', 'invoices', 'products', 'shop_settings', 'orders'
  ]
  LOOP
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',
        'Admin only - ' || tbl, tbl
      );
    END IF;
  END LOOP;
END $$;

-- The public contact form was removed, so visitors can no longer write requests
DROP POLICY IF EXISTS "Public can insert contact requests" ON contact_requests;

-- Photo storage: only admins can upload, change, delete or list files.
-- The bucket stays public, so photo URLs on the website keep working.
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND ('authenticated' = ANY (roles) OR 'public' = ANY (roles))
      AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Admin only - gallery files" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'gallery' AND public.is_admin())
  WITH CHECK (bucket_id = 'gallery' AND public.is_admin());
