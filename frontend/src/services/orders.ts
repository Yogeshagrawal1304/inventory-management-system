import api from './api'
import type { Order } from '@/types'

export const orderService = {
  getAll: () => api.get<Order[]>('/orders/').then(r => r.data),
  getById: (id: number) => api.get<Order>(`/orders/${id}`).then(r => r.data),
  create: (data: { customer_id: number; items: { product_id: number; quantity: number }[] }) =>
    api.post<Order>('/orders/', data).then(r => r.data),
  updateStatus: (id: number, status: Order['status']) =>
    api.patch<Order>(`/orders/${id}/status`, { status }).then(r => r.data),
}
