-- ============================================================
-- Shree Radhe Cafe - Seed Data
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- Insert Categories
INSERT INTO categories (name, sort_order) VALUES
  ('Chai & Beverages', 1),
  ('Snacks', 2),
  ('Main Course', 3),
  ('Desserts', 4),
  ('Cold Drinks', 5);

-- Insert Menu Items
-- Chai & Beverages
INSERT INTO menu_items (name, description, price, category_id, is_available, is_daily_special) VALUES
  ('Masala Chai', 'Rich aromatic tea with traditional Indian spices', 30.00, (SELECT id FROM categories WHERE name = 'Chai & Beverages'), true, false),
  ('Adrak Chai', 'Fresh ginger-infused tea, perfect for rainy days', 35.00, (SELECT id FROM categories WHERE name = 'Chai & Beverages'), true, false),
  ('Filter Coffee', 'South Indian style strong filter coffee', 40.00, (SELECT id FROM categories WHERE name = 'Chai & Beverages'), true, false),
  ('Hot Chocolate', 'Creamy Belgian cocoa with whipped cream', 80.00, (SELECT id FROM categories WHERE name = 'Chai & Beverages'), true, false),
  ('Green Tea', 'Light and refreshing Japanese green tea', 45.00, (SELECT id FROM categories WHERE name = 'Chai & Beverages'), true, false);

-- Snacks
INSERT INTO menu_items (name, description, price, category_id, is_available, is_daily_special) VALUES
  ('Samosa', 'Crispy golden pastry filled with spiced potatoes', 20.00, (SELECT id FROM categories WHERE name = 'Snacks'), true, true),
  ('Vada Pav', 'Mumbai style spiced potato fritter in soft bun', 30.00, (SELECT id FROM categories WHERE name = 'Snacks'), true, false),
  ('Bread Pakora', 'Crispy gram flour coated bread with mint chutney', 35.00, (SELECT id FROM categories WHERE name = 'Snacks'), true, false),
  ('Paneer Tikka', 'Grilled cottage cheese with bell peppers, spices', 120.00, (SELECT id FROM categories WHERE name = 'Snacks'), true, false),
  ('Spring Roll', 'Crispy rolls stuffed with vegetables and noodles', 60.00, (SELECT id FROM categories WHERE name = 'Snacks'), true, false),
  ('Pav Bhaji', 'Spiced mashed vegetables with buttered pav bread', 80.00, (SELECT id FROM categories WHERE name = 'Snacks'), true, false);

-- Main Course
INSERT INTO menu_items (name, description, price, category_id, is_available, is_daily_special) VALUES
  ('Chole Bhature', 'Spicy chickpea curry with fluffy fried bread', 100.00, (SELECT id FROM categories WHERE name = 'Main Course'), true, false),
  ('Paneer Butter Masala', 'Creamy tomato gravy with soft paneer cubes', 150.00, (SELECT id FROM categories WHERE name = 'Main Course'), true, false),
  ('Dal Makhani', 'Slow-cooked black lentils in rich butter gravy', 130.00, (SELECT id FROM categories WHERE name = 'Main Course'), true, false),
  ('Veg Biryani', 'Fragrant basmati rice with mixed vegetables', 140.00, (SELECT id FROM categories WHERE name = 'Main Course'), true, true),
  ('Rajma Chawal', 'Kidney bean curry served with steamed rice', 110.00, (SELECT id FROM categories WHERE name = 'Main Course'), true, false);

-- Desserts
INSERT INTO menu_items (name, description, price, category_id, is_available, is_daily_special) VALUES
  ('Gulab Jamun', 'Soft milk dumplings soaked in rose-cardamom syrup', 50.00, (SELECT id FROM categories WHERE name = 'Desserts'), true, false),
  ('Rasgulla', 'Spongy cottage cheese balls in light sugar syrup', 50.00, (SELECT id FROM categories WHERE name = 'Desserts'), true, false),
  ('Kulfi', 'Traditional Indian frozen dessert with pistachios', 60.00, (SELECT id FROM categories WHERE name = 'Desserts'), true, false),
  ('Jalebi', 'Crispy spiral-shaped sweets soaked in saffron syrup', 40.00, (SELECT id FROM categories WHERE name = 'Desserts'), true, false);

-- Cold Drinks
INSERT INTO menu_items (name, description, price, category_id, is_available, is_daily_special) VALUES
  ('Mango Lassi', 'Thick creamy yogurt smoothie with fresh mango', 60.00, (SELECT id FROM categories WHERE name = 'Cold Drinks'), true, false),
  ('Cold Coffee', 'Iced coffee blended with vanilla ice cream', 70.00, (SELECT id FROM categories WHERE name = 'Cold Drinks'), true, false),
  ('Fresh Lime Soda', 'Refreshing citrus soda, sweet or salty', 40.00, (SELECT id FROM categories WHERE name = 'Cold Drinks'), true, false),
  ('Buttermilk', 'Spiced chilled buttermilk with cumin and mint', 30.00, (SELECT id FROM categories WHERE name = 'Cold Drinks'), true, false),
  ('Rose Sharbat', 'Chilled rose-flavored sweet drink with basil seeds', 45.00, (SELECT id FROM categories WHERE name = 'Cold Drinks'), true, false);
