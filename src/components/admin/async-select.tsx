"use client"

import { useEffect, useState, useRef } from "react"

type Option = { label: string; value: string | number; [k: string]: any }

export default function AsyncSelect<T extends Option>(props: {
  fetcher: (q: string) => Promise<T[]>
  value?: T | null
  onChange: (v: T | null) => void
  placeholder?: string
  renderOption?: (o: T) => React.ReactNode
}) {
  const { fetcher, value, onChange, placeholder, renderOption } = props
  const [query, setQuery] = useState("")
  const [options, setOptions] = useState<T[]>([])
  const [open, setOpen] = useState(false)
  const timeout = useRef<number | null>(null)

  useEffect(() => {
    // fetch when query changes (debounced)
    if (timeout.current) window.clearTimeout(timeout.current)
    timeout.current = window.setTimeout(() => {
      void fetcher(query).then((res) => setOptions(res)).catch(() => setOptions([]))
    }, 250)
    return () => { if (timeout.current) window.clearTimeout(timeout.current) }
  }, [query, fetcher])

  useEffect(() => {
    // initial load
    void fetcher("").then((res) => setOptions(res)).catch(() => setOptions([]))
  }, [fetcher])

  return (
    <div className="relative">
      <input
        value={open ? query : (value ? String(value.label) : query)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border px-3 py-2"
      />
      {open && options.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-surface-primary">
          {options.map((o) => (
            <li
              key={String(o.value)}
              onMouseDown={(ev) => { ev.preventDefault(); onChange(o); setOpen(false) }}
              className="cursor-pointer px-3 py-2 hover:bg-surface-hover"
            >
              {renderOption ? renderOption(o) : o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
