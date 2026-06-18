import api from './api'
import type { DashboardStats } from '@/types'

export const dashboardService = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats').then(r => r.data),
  getMonthlyOrders: () =>
    api.get<{ month: string; orders: number }[]>('/dashboard/monthly-orders').then(r => r.data),
  getStockDistribution: () =>
    api.get<{ name: string; value: number }[]>('/dashboard/stock-distribution').then(r => r.data),
}
