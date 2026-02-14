import type { ReactNode } from "react"
import type { StatusCardLevel } from "../types"
import { Card, CardContent } from "./ui/card"
import { cn } from "../lib/utils"

interface Props {
  label: string
  value: string | number
  unit?: string
  level?: StatusCardLevel
  icon?: ReactNode
  compact?: boolean
}

const levelStyles: Record<StatusCardLevel, { border: string; bg: string; icon: string }> = {
  OK: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  WARN: {
    border: "border-l-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    icon: "text-amber-600 dark:text-amber-400",
  },
  ERROR: {
    border: "border-l-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    icon: "text-red-600 dark:text-red-400",
  },
  INFO: {
    border: "border-l-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    icon: "text-blue-600 dark:text-blue-400",
  },
}

export function StatusCard({
  label,
  value,
  unit,
  level,
  icon,
  compact = false,
}: Props) {
  const styles = level ? levelStyles[level] : null

  return (
    <Card
      className={cn(
        "rounded-xl shadow-sm transition-all duration-200 hover:shadow-md",
        level && "border-l-4",
        styles?.border,
        styles?.bg
      )}
    >
      <CardContent
        className={cn(
          compact ? "px-4 py-3" : "px-5 py-4"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={cn(
                "font-medium tracking-wide text-muted-foreground uppercase",
                compact ? "text-[10px] mb-1" : "text-xs mb-1.5"
              )}
            >
              {label}
            </p>

            <p
              className={cn(
                "tracking-tight truncate",
                compact ? "text-lg font-semibold" : "text-2xl font-semibold"
              )}
            >
              {value}
              {unit && (
                <span
                  className={cn(
                    "font-normal text-muted-foreground ml-1",
                    compact ? "text-xs" : "text-sm"
                  )}
                >
                  {unit}
                </span>
              )}
            </p>
          </div>

          {icon && (
            <div
              className={cn(
                "shrink-0",
                compact ? "mt-0 text-base" : "mt-0.5 text-xl",
                styles?.icon
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
