-- ============================================================
-- SQL Updates for Admin Reports & Payment Status
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add payment_status column to orders table
ALTER TABLE orders 
ADD COLUMN payment_status TEXT DEFAULT 'unpaid';

-- 2. Update existing orders to have a default status
-- If payment_method is NOT 'cash' (e.g. 'upi', 'qr'), mark as 'paid' automatically?
-- Or just default everything to 'unpaid' for now and let admin manage it.
-- Let's set 'unpaid' as default for safety.

-- 3. Policy updates (if any needed for the new column)
-- The existing "Anyone can update orders" policy covers this column too.
