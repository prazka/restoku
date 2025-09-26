import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  customer_address: string
  items: OrderItem[]
  total_amount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered'
  created_at: string
}

export type OrderItem = {
  product_id: string
  product_name: string
  quantity: number
  price: number
}