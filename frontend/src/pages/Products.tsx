import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { productService } from '@/services/products'
import type { Product } from '@/types'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z
    .string()
    .min(1, 'Price is required')
    .refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Price must be greater than 0'),
  stock_quantity: z
    .string()
    .min(1, 'Stock is required')
    .refine(v => !isNaN(Number(v)) && Number(v) >= 0, 'Stock cannot be negative'),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type ProductForm = z.infer<typeof productSchema>

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) return <Badge variant="destructive">Out of Stock</Badge>
  if (qty <= 10) return <Badge variant="warning">Low Stock</Badge>
  return <Badge variant="success">In Stock</Badge>
}

export function Products() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  })

  const createMutation = useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Product added successfully')
      setOpen(false)
      reset()
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      toast.error(e.response?.data?.detail || 'Failed to create product')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) =>
      productService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated successfully')
      setOpen(false)
      setEditing(null)
      reset()
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      toast.error(e.response?.data?.detail || 'Failed to update product')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Product deleted')
    },
  })

  const filtered = products.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function openAdd() {
    setEditing(null)
    reset({ name: '', sku: '', price: '', stock_quantity: '', image_url: '' })
    setOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    reset({
      name: p.name,
      sku: p.sku,
      price: String(p.price),
      stock_quantity: String(p.stock_quantity),
      image_url: p.image_url || '',
    })
    setOpen(true)
  }

  function onSubmit(data: ProductForm) {
    const payload = {
      name: data.name,
      sku: data.sku,
      price: Number(data.price),
      stock_quantity: Number(data.stock_quantity),
      image_url: data.image_url || undefined,
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">{products.length} total products</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading products...</div>
          ) : paginated.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Package className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Image</th>
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">SKU</th>
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Price</th>
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Stock</th>
                    <th className="text-left px-6 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right px-6 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(p => (
                    <tr key={p.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-md object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">{p.name}</td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{p.sku}</td>
                      <td className="px-6 py-4">${Number(p.price).toFixed(2)}</td>
                      <td className="px-6 py-4">{p.stock_quantity}</td>
                      <td className="px-6 py-4"><StockBadge qty={p.stock_quantity} /></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm('Delete this product?')) deleteMutation.mutate(p.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" {...register('name')} placeholder="Laptop Pro 15" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register('sku')} placeholder="LP-001" />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" type="number" step="0.01" {...register('price')} placeholder="999.99" />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input id="stock" type="number" {...register('stock_quantity')} placeholder="100" />
                {errors.stock_quantity && (
                  <p className="text-xs text-destructive">{errors.stock_quantity.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input id="image" {...register('image_url')} placeholder="https://..." />
              {errors.image_url && <p className="text-xs text-destructive">{errors.image_url.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
                {editing ? 'Save Changes' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
