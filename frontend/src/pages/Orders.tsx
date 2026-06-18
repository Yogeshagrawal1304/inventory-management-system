import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, ShoppingCart, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { orderService } from '@/services/orders'
import { productService } from '@/services/products'
import { customerService } from '@/services/customers'
import type { Order, Product, Customer } from '@/types'

interface CartItem {
  product: Product
  quantity: number
}

export function Orders() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getAll,
  })
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
    enabled: open,
  })
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: customerService.getAll,
    enabled: open,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Order['status'] }) =>
      orderService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Order status updated')
    },
    onError: () => toast.error('Failed to update status'),
  })

  const createMutation = useMutation({
    mutationFn: orderService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      qc.invalidateQueries({ queryKey: ['stock-distribution'] })
      toast.success('Order created successfully')
      resetModal()
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      toast.error(e.response?.data?.detail || 'Failed to create order')
    },
  })

  function resetModal() {
    setOpen(false)
    setStep(1)
    setSelectedCustomer(null)
    setCart([])
  }

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  function updateQty(productId: number, qty: number) {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.product.id !== productId))
    } else {
      setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i))
    }
  }

  const grandTotal = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)

  function placeOrder() {
    if (!selectedCustomer) return
    createMutation.mutate({
      customer_id: selectedCustomer.id,
      items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">{orders.length} total orders</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Order
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Items</th>
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Total</th>
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">#{o.id.toString().padStart(4, '0')}</td>
                      <td className="px-6 py-4 font-medium">Customer #{o.customer_id}</td>
                      <td className="px-6 py-4">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                      <td className="px-6 py-4 font-medium">${Number(o.total_amount).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <Select
                          value={o.status}
                          onValueChange={(val) =>
                            statusMutation.mutate({ id: o.id, status: val as Order['status'] })
                          }
                        >
                          <SelectTrigger className="w-36 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-yellow-500 inline-block" />
                                Pending
                              </span>
                            </SelectItem>
                            <SelectItem value="completed">
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                                Completed
                              </span>
                            </SelectItem>
                            <SelectItem value="cancelled">
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                                Cancelled
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              New Order
              <span className="ml-2 text-sm text-muted-foreground font-normal">
                Step {step} of 4
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-blue-600' : 'bg-muted'}`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-medium">Select Customer</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {customers.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCustomer(c)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedCustomer?.id === c.id
                        ? 'border-blue-600 bg-blue-600/15'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.email}</p>
                  </button>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={() => setStep(2)} disabled={!selectedCustomer}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </DialogFooter>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-medium">Select Products</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {products.filter(p => p.stock_quantity > 0).map(p => {
                  const inCart = cart.find(i => i.product.id === p.id)
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30"
                    >
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${Number(p.price).toFixed(2)} · {p.stock_quantity} in stock
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={inCart ? 'secondary' : 'default'}
                        onClick={() => addToCart(p)}
                      >
                        {inCart ? `In cart (${inCart.quantity})` : 'Add'}
                      </Button>
                    </div>
                  )
                })}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={cart.length === 0}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </DialogFooter>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium">Set Quantities</h3>
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Max: {item.product.stock_quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Qty:</Label>
                      <Input
                        type="number"
                        min={1}
                        max={item.product.stock_quantity}
                        value={item.quantity}
                        onChange={e => updateQty(item.product.id, parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </div>
                    <p className="font-medium w-20 text-right">
                      ${(Number(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={() => setStep(4)}>
                  Review <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </DialogFooter>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-medium">Order Summary</h3>
              <Card>
                <CardHeader className="pb-2">
                  <p className="text-sm text-muted-foreground">
                    Customer: <span className="font-medium text-foreground">{selectedCustomer?.name}</span>
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2 font-medium text-muted-foreground">Product</th>
                        <th className="text-center pb-2 font-medium text-muted-foreground">Qty</th>
                        <th className="text-right pb-2 font-medium text-muted-foreground">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map(item => (
                        <tr key={item.product.id} className="border-b last:border-0">
                          <td className="py-2">{item.product.name}</td>
                          <td className="py-2 text-center">{item.quantity}</td>
                          <td className="py-2 text-right">
                            ${(Number(item.product.price) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between pt-2 font-semibold text-base border-t">
                    <span>Grand Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <Button onClick={placeOrder} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Placing...' : 'Place Order'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
