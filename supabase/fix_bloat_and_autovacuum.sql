-- ============================================================
-- STEP 1: Run first — manually vacuum all bloated tables NOW
-- This removes dead rows immediately and frees disk IO
-- ============================================================
VACUUM (VERBOSE, ANALYZE) public.users;
VACUUM (VERBOSE, ANALYZE) public.products;
VACUUM (VERBOSE, ANALYZE) public.notifications;
VACUUM (VERBOSE, ANALYZE) public.support_tickets;
VACUUM (VERBOSE, ANALYZE) public.messages;
VACUUM (VERBOSE, ANALYZE) public.admin_logs;

-- ============================================================
-- STEP 2: Tune autovacuum per-table so dead rows never pile up
-- Default thresholds are too high for small free-tier tables
-- ============================================================

-- users: 15 live rows, vacuum when 5 rows dead (~33%)
ALTER TABLE public.users SET (
  autovacuum_vacuum_threshold     = 5,
  autovacuum_vacuum_scale_factor  = 0.05,
  autovacuum_analyze_threshold    = 5,
  autovacuum_analyze_scale_factor = 0.05
);

-- products: 14 live rows, vacuum often
ALTER TABLE public.products SET (
  autovacuum_vacuum_threshold     = 5,
  autovacuum_vacuum_scale_factor  = 0.1,
  autovacuum_analyze_threshold    = 5,
  autovacuum_analyze_scale_factor = 0.1
);

-- notifications: high churn (read+delete frequently)
ALTER TABLE public.notifications SET (
  autovacuum_vacuum_threshold     = 5,
  autovacuum_vacuum_scale_factor  = 0.05,
  autovacuum_analyze_threshold    = 5,
  autovacuum_analyze_scale_factor = 0.05
);

-- support_tickets: tiny table, vacuum after 2 dead rows
ALTER TABLE public.support_tickets SET (
  autovacuum_vacuum_threshold     = 2,
  autovacuum_vacuum_scale_factor  = 0.1,
  autovacuum_analyze_threshold    = 2,
  autovacuum_analyze_scale_factor = 0.1
);

-- messages: realtime table, vacuum frequently
ALTER TABLE public.messages SET (
  autovacuum_vacuum_threshold     = 5,
  autovacuum_vacuum_scale_factor  = 0.05,
  autovacuum_analyze_threshold    = 5,
  autovacuum_analyze_scale_factor = 0.05
);

-- admin_logs: append-only, less critical but still tune
ALTER TABLE public.admin_logs SET (
  autovacuum_vacuum_threshold     = 10,
  autovacuum_vacuum_scale_factor  = 0.1,
  autovacuum_analyze_threshold    = 10,
  autovacuum_analyze_scale_factor = 0.1
);

-- ============================================================
-- STEP 3: Reset pg_stat_statements so you can track fresh data
-- ============================================================
SELECT pg_stat_statements_reset();

-- ============================================================
-- VERIFY: Run after VACUUM to confirm dead rows are cleared
-- ============================================================
SELECT
  relname AS table,
  n_dead_tup AS dead_rows,
  n_live_tup AS live_rows,
  last_autovacuum,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE relname IN ('users','products','notifications','support_tickets','messages','admin_logs')
ORDER BY n_dead_tup DESC;
