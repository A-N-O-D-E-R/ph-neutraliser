import { cn } from "../../lib/utils"

export default function MessagingCard({
  title,
  icon,
  enabled,
  onToggle,
  children,
}: {
  title: string
  icon: React.ReactNode
  enabled: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className={cn("rounded-lg border p-4 space-y-4 transition-colors", enabled ? "border-primary/30 bg-primary/5" : "border-border")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors",
            enabled ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
              enabled ? "translate-x-4" : "translate-x-0"
            )}
          />
        </button>
      </div>
      {enabled && <div className="space-y-3">{children}</div>}
    </div>
  )
}