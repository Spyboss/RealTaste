-- Fix variant_id constraint to allow NULL values
-- This allows order items to be created without a variant (for items that don't have size options)

-- Drop the existing foreign key constraint
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_variant_id_fkey;

-- Add the foreign key constraint back with NULL allowed
ALTER TABLE order_items ADD CONSTRAINT order_items_variant_id_fkey 
  FOREIGN KEY (variant_id) REFERENCES menu_variants(id) ON DELETE RESTRICT;

-- Ensure the variant_id column allows NULL values
ALTER TABLE order_items ALTER COLUMN variant_id DROP NOT NULL;

-- Add a comment to document this change
COMMENT ON COLUMN order_items.variant_id IS 'Optional variant ID - NULL for items without size/variant options';