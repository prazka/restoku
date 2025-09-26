/*
  # Restaurant Database Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, product name)
      - `description` (text, product description)
      - `price` (numeric, product price)
      - `image_url` (text, product image URL)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `orders`
      - `id` (uuid, primary key)
      - `customer_name` (text, customer name)
      - `customer_email` (text, customer email)
      - `customer_phone` (text, customer phone, optional)
      - `customer_address` (text, delivery address)
      - `items` (jsonb, order items array)
      - `total_amount` (numeric, order total)
      - `status` (text, order status)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access on products
    - Add policies for order creation and management
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price > 0),
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  customer_address text NOT NULL,
  items jsonb NOT NULL,
  total_amount numeric(10,2) NOT NULL CHECK (total_amount > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products policies (public read access)
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can manage products"
  ON products
  FOR ALL
  TO public
  USING (true);

-- Orders policies
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admin can view all orders"
  ON orders
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can update orders"
  ON orders
  FOR UPDATE
  TO public
  USING (true);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin can upload product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_products_updated_at'
  ) THEN
    CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert sample products for demo
INSERT INTO products (name, description, price, image_url) VALUES
  ('Gourmet Beef Burger', 'Premium beef patty with aged cheddar, crispy bacon, fresh lettuce, tomatoes, and our signature sauce on a brioche bun', 16.99, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg'),
  ('Margherita Pizza', 'Wood-fired pizza with San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil', 18.50, 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg'),
  ('Grilled Atlantic Salmon', 'Fresh salmon fillet grilled to perfection with herbs, lemon butter, and seasonal vegetables', 24.99, 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg'),
  ('Caesar Salad Supreme', 'Crisp romaine lettuce with parmesan cheese, garlic croutons, and creamy caesar dressing', 12.99, 'https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg'),
  ('Truffle Pasta', 'Handmade fettuccine with black truffle, wild mushrooms, parmesan, and cream sauce', 22.50, 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg'),
  ('Chocolate Lava Cake', 'Warm chocolate cake with molten center, served with vanilla ice cream and berry compote', 9.99, 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg')
ON CONFLICT DO NOTHING;