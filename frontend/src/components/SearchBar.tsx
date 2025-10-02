import { useState, useEffect } from 'react'
import { IconSearch, IconX } from '@tabler/icons-react'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search tasks...',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue)
    }, 300) // Debounce 300ms

    return () => clearTimeout(timer)
  }, [localValue, onChange])

  return (
    <div className="relative flex items-center">
      <IconSearch className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-9 pr-9"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLocalValue('')
            onChange('')
          }}
          className="absolute right-1 h-7 w-7 p-0"
        >
          <IconX className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
