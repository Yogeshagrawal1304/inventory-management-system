import api from './api'
import type { Customer } from '@/types'

export const customerService = {
  getAll: () => api.get<Customer[]>('/customers/').then(r => r.data),
  getById: (id: number) => api.get<Customer>(`/customers/${id}`).then(r => r.data),
  create: (data: Omit<Customer, 'id' | 'created_at' | 'orders_count'>) =>
    api.post<Customer>('/customers/', data).then(r => r.data),
  update: (id: number, data: Partial<Customer>) =>
    api.put<Customer>(`/customers/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/customers/${id}`),
}
