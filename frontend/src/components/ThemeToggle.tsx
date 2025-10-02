import { IconMoon, IconSun } from '@tabler/icons-react'
import { Button } from './ui/button'
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <IconMoon className="h-4 w-4" />
      ) : (
        <IconSun className="h-4 w-4" />
      )}
    </Button>
  )
}
