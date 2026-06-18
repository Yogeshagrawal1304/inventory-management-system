import { useQuery } from '@tanstack/react-query'
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardService } from '@/services/dashboard'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444']

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: number | undefined
  icon: React.ElementType
  color: string
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value ?? '—'}</div>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  })
  const { data: monthly } = useQuery({
    queryKey: ['monthly-orders'],
    queryFn: dashboardService.getMonthlyOrders,
  })
  const { data: stockDist } = useQuery({
    queryKey: ['stock-distribution'],
    queryFn: dashboardService.getStockDistribution,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your inventory and orders</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={stats?.total_products}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Customers"
          value={stats?.total_customers}
          icon={Users}
          color="bg-emerald-500"
        />
        <StatCard
          title="Total Orders"
          value={stats?.total_orders}
          icon={ShoppingCart}
          color="bg-violet-500"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats?.low_stock_products}
          icon={AlertTriangle}
          color="bg-amber-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {monthly && monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No order data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {stockDist && stockDist.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stockDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stockDist.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No stock data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {statsLoading && (
        <div className="text-center text-muted-foreground text-sm">Loading stats...</div>
      )}
    </div>
  )
}
