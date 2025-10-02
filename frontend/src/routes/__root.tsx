import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ThemeToggle } from '@/components/ThemeToggle'
import { IconPaw } from '@tabler/icons-react'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconPaw className="h-7 w-7 text-primary" />
                <h1 className="text-2xl font-bold">Tasker</h1>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
    </>
  ),
})
