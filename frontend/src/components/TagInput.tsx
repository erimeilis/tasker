import { useState, KeyboardEvent, useRef, useEffect } from 'react'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { IconX } from '@tabler/icons-react'
import { Button } from './ui/button'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  existingTags?: string[]
}

export function TagInput({
  tags,
  onChange,
  placeholder = 'Type to add tags...',
  existingTags = [],
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on input
  const suggestions = existingTags
    .filter(
      (tag) =>
        tag.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(tag) &&
        inputValue.length > 0
    )
    .slice(0, 5)

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0)
    setSelectedIndex(0)
  }, [inputValue, suggestions.length])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (showSuggestions && suggestions[selectedIndex]) {
        addTag(suggestions[selectedIndex])
      } else {
        addTag()
      }
    } else if (e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const addTag = (tag?: string) => {
    const trimmed = tag?.trim() || inputValue.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
      setInputValue('')
      setShowSuggestions(false)
      inputRef.current?.focus()
    }
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2 mt-2">
      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="gap-1 px-3 py-1.5 text-sm"
          >
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeTag(index)}
              className="h-4 w-4 p-0 hover:bg-transparent ml-1"
            >
              <IconX className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
        />

        {showSuggestions && (
          <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent cursor-pointer transition-colors ${
                  index === selectedIndex ? 'bg-accent' : ''
                }`}
                onClick={() => addTag(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add • Use arrow keys to navigate suggestions
      </p>
    </div>
  )
}
