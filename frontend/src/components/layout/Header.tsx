import { Bell, Moon, Sun, Search, User, Menu, Settings, LogOut, AlertTriangle, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/useTheme'
import { productService } from '@/services/products'
import type { Product } from '@/types'

const LOW_STOCK_THRESHOLD = 10

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
  })

  const lowStockProducts = products.filter((p: Product) => p.stock_quantity <= LOW_STOCK_THRESHOLD)
  const alertCount = lowStockProducts.length

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 h-9 bg-muted/50" />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {alertCount === 0 ? (
              <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                All products are well stocked
              </div>
            ) : (
              <>
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  {alertCount} product{alertCount !== 1 ? 's' : ''} need attention
                </div>
                {lowStockProducts.map((p: Product) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => navigate('/inventory')}
                    className="flex items-start gap-3 py-2.5"
                  >
                    <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${p.stock_quantity === 0 ? 'text-red-500' : 'text-yellow-500'}`} />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.stock_quantity === 0 ? 'Out of stock' : `${p.stock_quantity} units left`}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="flex items-center gap-3 px-3 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Admin User</span>
                <span className="text-xs text-muted-foreground">admin@invenms.com</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => toast.info('Auth system coming soon')}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
