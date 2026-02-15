import { Card, CardContent } from "./ui/card"
import { cn } from "../lib/utils"
import { ReactNode } from "react"

interface Props {
  label: string
  current?: number
  target?: number
  unit?: string
  icon?: ReactNode
  tolerance?: number     
  precision?: number 
}

export function StatusCardWithTarget({
  label,
  current,
  target,
  unit,
  icon,
  tolerance = 0.1,        // default tolerance
  precision = 2,          // default decimals
}: Props) {
   const hasValues =
    current !== undefined && target !== undefined

  const diff =
    hasValues ? current! - target! : undefined

  const isWithinRange =
    diff !== undefined && Math.abs(diff) <= tolerance

  const levelColor =
    diff === undefined
      ? ""
      : isWithinRange
      ? "border-l-green-500"
      : diff > 0
      ? "border-l-red-500"
      : "border-l-orange-500"

  return (
    <Card
      className={cn(
        "rounded-xl shadow-sm border",
        hasValues && "border-l-4",
        levelColor
      )}
    >
      <CardContent className="px-6 py-6 space-y-3">

        {/* Header */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          {icon}
        </div>

        {/* Current */}
        <div className="text-3xl font-bold tracking-tight">
          {current !== undefined && current !== null ? current.toFixed(precision) : "--"}
          {unit && (
            <span className="ml-1 text-base font-normal text-muted-foreground">
              {unit}
            </span>
          )}
        </div>

        {/* Target */}
        <div className="text-sm text-muted-foreground">
          Target:{" "}
          <span className="font-medium text-foreground">
            {target !== undefined && target !== null ? target.toFixed(precision) : "--"}
          </span>
          {unit}
        </div>

        {/* Difference */}
        {diff !== undefined && (
          <div
            className={cn(
              "text-xs font-medium",
              isWithinRange
                ? "text-green-600"
                : diff > 0
                ? "text-red-600"
                : "text-orange-600"
            )}
          >
            {isWithinRange
              ? "Within range"
              : diff > 0
              ? "Above target"
              : "Below target"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
