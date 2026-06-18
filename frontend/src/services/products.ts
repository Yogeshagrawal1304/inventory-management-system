import api from './api'
import type { Product } from '@/types'

export const productService = {
  getAll: () => api.get<Product[]>('/products/').then(r => r.data),
  getById: (id: number) => api.get<Product>(`/products/${id}`).then(r => r.data),
  create: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Product>('/products/', data).then(r => r.data),
  update: (id: number, data: Partial<Product>) =>
    api.put<Product>(`/products/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/products/${id}`),
}
