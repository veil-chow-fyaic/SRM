-- Fix RLS Policies for Security - Phase 1
-- This migration fixes overly permissive RLS policies
-- Date: 2026-02-11

-- =====================================================
-- 1. SUPPLIERS TABLE - Fix RLS policies
-- =====================================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow authenticated delete on suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow authenticated insert on suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow authenticated update on suppliers" ON suppliers;

-- Create new policies with auth.uid() checks
CREATE POLICY "Users can view suppliers"
  ON suppliers FOR SELECT
  TO authenticated, anon
  USING (true);  -- Public read access

CREATE POLICY "Users can insert suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can update own suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR created_by IS NULL)
  WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can delete own suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by OR created_by IS NULL);

-- =====================================================
-- 2. CONTRACTS TABLE - Fix RLS policies
-- =====================================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can create contracts" ON contracts;
DROP POLICY IF EXISTS "Authenticated users can update contracts" ON contracts;

-- Create new policies with auth.uid() checks
CREATE POLICY "Users can view contracts"
  ON contracts FOR SELECT
  TO authenticated, anon
  USING (true);  -- Public read access

CREATE POLICY "Users can create contracts"
  ON contracts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own contracts"
  ON contracts FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- =====================================================
-- 3. DERIVATIVE_RESOURCES TABLE - Fix RLS policies
-- =====================================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can create derivative_resources" ON derivative_resources;
DROP POLICY IF EXISTS "Authenticated users can update derivative_resources" ON derivative_resources;
DROP POLICY IF EXISTS "Authenticated users can delete derivative_resources" ON derivative_resources;

-- Create new policies with proper access control
CREATE POLICY "Users can view derivative resources"
  ON derivative_resources FOR SELECT
  TO authenticated, anon
  USING (true);  -- Public read access

CREATE POLICY "Users can create derivative resources"
  ON derivative_resources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (
    SELECT id FROM suppliers WHERE id = derivative_resources.supplier_id
  ));

CREATE POLICY "Users can update own derivative resources"
  ON derivative_resources FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT created_by FROM suppliers WHERE id = derivative_resources.supplier_id
  ))
  WITH CHECK (auth.uid() IN (
    SELECT created_by FROM suppliers WHERE id = derivative_resources.supplier_id
  ));

CREATE POLICY "Users can delete own derivative resources"
  ON derivative_resources FOR DELETE
  TO authenticated
  USING (auth.uid() IN (
    SELECT created_by FROM suppliers WHERE id = derivative_resources.supplier_id
  ));

-- =====================================================
-- 4. SUPPLIER_FILES TABLE - Fix RLS policies
-- =====================================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can upload files" ON supplier_files;

-- Create new policy with auth.uid() check
CREATE POLICY "Users can view supplier files"
  ON supplier_files FOR SELECT
  TO authenticated, anon
  USING (true);  -- Public read access

CREATE POLICY "Users can upload files"
  ON supplier_files FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploaded_by OR uploaded_by IS NULL);

CREATE POLICY "Users can update own files"
  ON supplier_files FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploaded_by)
  WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own files"
  ON supplier_files FOR DELETE
  TO authenticated
  USING (auth.uid() = uploaded_by);
