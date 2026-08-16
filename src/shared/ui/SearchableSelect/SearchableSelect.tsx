import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from '@/shared/i18n'

export interface SearchableSelectOption {
  value: string
  label: string
}

export interface SearchableSelectProps {
  options: readonly SearchableSelectOption[]
  value: string | undefined
  onChange: (value: string) => void
  onQueryChange: (query: string) => void
  placeholder?: string
  ariaLabel: string
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  onQueryChange,
  placeholder,
  ariaLabel,
  isLoading = false,
  emptyMessage,
  className,
}: SearchableSelectProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  const selectedOption = options.find((option) => option.value === value)
  const inputValue = isOpen ? query : (selectedOption?.label ?? '')
  const clampedActiveIndex = activeIndex < options.length ? activeIndex : -1

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isOpen])

  function selectOption(option: SearchableSelectOption) {
    onChange(option.value)
    setQuery('')
    setIsOpen(false)
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value

    setQuery(nextQuery)
    setIsOpen(true)
    setActiveIndex(-1)
    onQueryChange(nextQuery)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()

      if (!isOpen) {
        setIsOpen(true)
        return
      }

      setActiveIndex((index) => (options.length === 0 ? -1 : (index + 1) % options.length))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()

      if (!isOpen) {
        setIsOpen(true)
        return
      }

      setActiveIndex((index) => (options.length === 0 ? -1 : (index - 1 + options.length) % options.length))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()

      if (!isOpen) {
        setIsOpen(true)
        return
      }

      const option = options[clampedActiveIndex]

      if (option) {
        selectOption(option)
      }

      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setQuery('')
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <input
        type="text"
        role="combobox"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={isOpen && clampedActiveIndex >= 0 ? `${listboxId}-option-${clampedActiveIndex}` : undefined}
        className="min-h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
      />

      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-lg"
        >
          {isLoading ? (
            <li className="px-3 py-2 text-sm text-slate-400">{t('searchableSelect.loading')}</li>
          ) : options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400">{emptyMessage ?? t('searchableSelect.empty')}</li>
          ) : (
            options.map((option, index) => (
              <li
                key={option.value}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
                className={[
                  'flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                  index === clampedActiveIndex ? 'bg-slate-800 text-white' : 'text-slate-300',
                ].join(' ')}
              >
                <span>{option.label}</span>
                {option.value === value ? (
                  <span aria-hidden="true" className="text-sky-400">
                    ✓
                  </span>
                ) : null}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}
