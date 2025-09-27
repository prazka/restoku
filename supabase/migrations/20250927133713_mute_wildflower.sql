/*
  # Update Image Storage Configuration

  1. Changes
    - Modify image_url column to support both URL and base64 data
    - Add helper functions for image handling
    - Update existing data if needed

  2. Notes
    - This migration allows storing both URL and base64 image data
    - The application will handle both formats automatically
*/

-- Add a comment to the image_url column to clarify it can store both formats
COMMENT ON COLUMN products.image_url IS 'Can store either HTTP URL or base64 data URI (data:image/...)';

-- Create a function to validate image data
CREATE OR REPLACE FUNCTION validate_image_data(image_data text)
RETURNS boolean AS $$
BEGIN
  -- Check if it's a valid HTTP URL or base64 data URI
  RETURN (
    image_data ~ '^https?://' OR 
    image_data ~ '^data:image/(jpeg|jpg|png|gif|webp);base64,'
  );
END;
$$ LANGUAGE plpgsql;

-- Add a check constraint to ensure valid image data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'products_image_url_format_check'
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT products_image_url_format_check 
    CHECK (validate_image_data(image_url));
  END IF;
END $$;

-- Update the updated_at trigger to handle image changes
CREATE OR REPLACE FUNCTION update_product_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Log image format change if applicable
  IF OLD.image_url IS DISTINCT FROM NEW.image_url THEN
    -- You can add logging here if needed
    NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger with the new function
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_timestamp();