"use client"

interface DatePickerProps {
  dates: string[]
  selected: string
  onSelect: (date: string) => void
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  const day = d.toLocaleDateString("en-US", { weekday: "short" })
  const date = d.getDate()
  const month = d.toLocaleDateString("en-US", { month: "short" })
  return { day, date, month }
}

export function DatePicker({ dates, selected, onSelect }: DatePickerProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {dates.map((d) => {
        const { day, date, month } = formatShortDate(d)
        const isActive = d === selected
        return (
          <button
            key={d}
            type="button"
            onClick={() => onSelect(d)}
            className={`flex min-w-18 flex-col items-center gap-0.5 rounded-xl border px-3 py-2.5 text-center transition-all ${
              isActive
                ? "border-brand-secondary bg-brand-secondary text-surface-background shadow-sm"
                : "border-border bg-surface-primary text-muted-foreground hover:border-brand-secondary/50 hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            <span className="text-[11px] font-medium uppercase">{day}</span>
            <span className="text-xl font-bold leading-none">{date}</span>
            <span className="text-[11px] font-medium uppercase">{month}</span>
          </button>
        )
      })}
    </div>
  )
}
