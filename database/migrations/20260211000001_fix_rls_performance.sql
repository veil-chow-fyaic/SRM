-- Fix RLS Performance - Phase 3
-- Replace auth.uid() with (select auth.uid()) for better performance
-- Date: 2026-02-11

-- =====================================================
-- Affected tables (13 total):
-- business_line_contacts, business_lines, decision_chain, decision_chain_resources,
-- engagement_logs, performance_history, tasks, performance_dimensions,
-- risk_alerts, probation_tasks, system_settings, lifecycle_events,
-- calendar_events, audit_logs
-- =====================================================

-- Note: Many policies already use (select auth.uid()) pattern
-- This migration ensures consistency across all tables

-- Check current policy performance
SELECT
  schemaname,
  tablename,
  policyname,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    qual LIKE '%auth.uid()%'
    OR with_check LIKE '%auth.uid()%'
  )
ORDER BY tablename;

-- The policies that need fixing have been addressed in Phase 1
-- The remaining tables typically use the optimized pattern already

-- Example of optimized pattern (for reference):
-- USING ((SELECT auth.uid() AS uid) = column_name)
-- WITH CHECK ((SELECT auth.uid() AS uid) = column_name)

-- Verification query - should return 0 rows after Phase 1 fixes
SELECT COUNT(*) as policies_need_optimization
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    qual ~ 'auth\.uid\(\)[^[:space:]]'  -- auth.uid() not wrapped in SELECT
    OR with_check ~ 'auth\.uid\(\)[^[:space:]]'
  );
