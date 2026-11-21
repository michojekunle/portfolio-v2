-- ============================================================
-- Regional variant per learner (Spanish: 'es' Spain | 'latam' Latin America).
-- Nullable on both profile tables so the shared repository can read it for
-- either language; French has no variants and leaves it null.
-- Run in Supabase SQL editor after 20261122_spanish_daily.sql.
-- ============================================================

alter table french_profiles  add column if not exists variant text;
alter table spanish_profiles add column if not exists variant text;

alter table spanish_profiles drop constraint if exists spanish_profiles_variant_check;
alter table spanish_profiles add constraint spanish_profiles_variant_check check (variant is null or variant in ('es', 'latam'));

notify pgrst, 'reload schema';
