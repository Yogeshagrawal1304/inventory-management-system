import { useQuery } from '@tanstack/react-query'
import { Boxes } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { productService } from '@/services/products'

const LOW_STOCK_THRESHOLD = 10

function InventoryStatus({ qty }: { qty: number }) {
  if (qty === 0) return <Badge variant="destructive">Out of Stock</Badge>
  if (qty <= LOW_STOCK_THRESHOLD) return <Badge variant="warning">Low Stock</Badge>
  return <Badge variant="success">Healthy</Badge>
}

function StockBar({ qty, max }: { qty: number; max: number }) {
  const pct = max > 0 ? Math.min((qty / max) * 100, 100) : 0
  const color = qty === 0 ? 'bg-red-500' : qty <= LOW_STOCK_THRESHOLD ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Inventory() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
  })

  const maxStock = Math.max(...products.map(p => p.stock_quantity), 1)
  const outOfStock = products.filter(p => p.stock_quantity === 0).length
  const lowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD).length
  const healthy = products.filter(p => p.stock_quantity > LOW_STOCK_THRESHOLD).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">Stock levels across all products</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">{healthy}</div>
            <p className="text-sm text-muted-foreground mt-1">Healthy Stock</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-600">{lowStock}</div>
            <p className="text-sm text-muted-foreground mt-1">Low Stock (≤{LOW_STOCK_THRESHOLD})</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">{outOfStock}</div>
            <p className="text-sm text-muted-foreground mt-1">Out of Stock</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Boxes className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">No products in inventory</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Product</th>
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">SKU</th>
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Current Stock</th>
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Threshold</th>
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Level</th>
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .slice()
                    .sort((a, b) => a.stock_quantity - b.stock_quantity)
                    .map(p => (
                      <tr key={p.id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-medium">{p.name}</td>
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{p.sku}</td>
                        <td className="px-6 py-4 font-semibold">{p.stock_quantity}</td>
                        <td className="px-6 py-4 text-muted-foreground">{LOW_STOCK_THRESHOLD}</td>
                        <td className="px-6 py-4">
                          <StockBar qty={p.stock_quantity} max={maxStock} />
                        </td>
                        <td className="px-6 py-4">
                          <InventoryStatus qty={p.stock_quantity} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
