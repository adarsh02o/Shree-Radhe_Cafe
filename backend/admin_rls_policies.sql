-- ============================================================
-- Admin RLS Policies for Categories & Menu Items
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- Allow anyone to insert categories (for admin demo mode)
CREATE POLICY "Anyone can insert categories"
  ON categories FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update categories
CREATE POLICY "Anyone can update categories"
  ON categories FOR UPDATE
  USING (true);

-- Allow anyone to delete categories
CREATE POLICY "Anyone can delete categories"
  ON categories FOR DELETE
  USING (true);

-- Allow anyone to insert menu items
CREATE POLICY "Anyone can insert menu items"
  ON menu_items FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update menu items
CREATE POLICY "Anyone can update menu items"
  ON menu_items FOR UPDATE
  USING (true);

-- Allow anyone to delete menu items
CREATE POLICY "Anyone can delete menu items"
  ON menu_items FOR DELETE
  USING (true);

-- Allow anyone to update orders (for demo mode kitchen)
-- Drop the old authenticated-only policy first
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;

CREATE POLICY "Anyone can update orders"
  ON orders FOR UPDATE
  USING (true);
