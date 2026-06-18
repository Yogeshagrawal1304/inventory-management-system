import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'

export function Settings() {
  const { theme, toggle } = useTheme()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Customize how the application looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Currently using {theme} mode</p>
            </div>
            <Button variant="outline" onClick={toggle} className="gap-2">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Configuration</CardTitle>
          <CardDescription>Backend connection settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium">API Base URL</p>
            <p className="text-sm text-muted-foreground font-mono bg-muted px-3 py-2 rounded-md">
              {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
