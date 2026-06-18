export interface Product {
  id: number
  name: string
  sku: string
  price: number
  stock_quantity: number
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: number
  name: string
  email: string
  phone?: string
  created_at: string
  orders_count: number
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled'

export interface OrderItem {
  id: number
  product_id: number
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Order {
  id: number
  customer_id: number
  total_amount: number
  status: OrderStatus
  created_at: string
  items: OrderItem[]
}

export interface DashboardStats {
  total_products: number
  total_customers: number
  total_orders: number
  low_stock_products: number
  out_of_stock_products: number
}
