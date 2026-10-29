-- ============================================================
-- Koto Education - Agenda: reuniones, avisos e impuestos
-- ============================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
--
-- Events that are not service appointments (no client or pet), shown in the calendar
-- and on the dashboard until they are marked as done.

CREATE TABLE IF NOT EXISTS public.agenda_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL CHECK (btrim(title) <> ''),
  date date NOT NULL,
  time time,                      -- NULL = all day
  type text NOT NULL DEFAULT 'other' CHECK (type IN ('meeting', 'reminder', 'tax', 'other')),
  notes text,
  done boolean NOT NULL DEFAULT false,
  done_at timestamptz
);

CREATE INDEX IF NOT EXISTS agenda_events_date_idx ON public.agenda_events (date);

ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only - agenda_events" ON public.agenda_events;
CREATE POLICY "Admin only - agenda_events" ON public.agenda_events FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Tax deadlines for a self-employed person (autónoma) until 2030.
-- A deadline that falls on a weekend moves to the next Monday.
CREATE OR REPLACE FUNCTION pg_temp.next_working_day(d date) RETURNS date
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE extract(isodow FROM d)
    WHEN 6 THEN d + 2
    WHEN 7 THEN d + 1
    ELSE d
  END
$$;

WITH deadlines (title, due, notes) AS (
  SELECT
    format('IVA (303) e IRPF (130) · %sT %s', q, y),
    pg_temp.next_working_day(CASE q
      WHEN 1 THEN make_date(y, 4, 20)
      WHEN 2 THEN make_date(y, 7, 20)
      WHEN 3 THEN make_date(y, 10, 20)
      ELSE make_date(y + 1, 1, 30)
    END),
    'Último día para presentar. Si se domicilia el pago, el plazo termina 5 días antes.'
  FROM generate_series(2026, 2030) AS y, generate_series(1, 4) AS q
  UNION ALL
  SELECT
    format('Resumen anual IVA (390) · %s', y),
    pg_temp.next_working_day(make_date(y + 1, 1, 30)),
    'Se presenta junto con el 303 del 4º trimestre.'
  FROM generate_series(2026, 2030) AS y
  UNION ALL
  SELECT
    format('Declaración de la Renta · %s', y),
    pg_temp.next_working_day(make_date(y + 1, 6, 30)),
    'Último día para presentar. Si sale a pagar y se domicilia, el plazo termina unos días antes.'
  FROM generate_series(2025, 2029) AS y
)
INSERT INTO public.agenda_events (title, date, type, notes)
SELECT d.title, d.due, 'tax', d.notes
FROM deadlines d
WHERE d.due >= CURRENT_DATE
  AND NOT EXISTS (SELECT 1 FROM public.agenda_events e WHERE e.title = d.title);
