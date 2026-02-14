import { useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./ui/chart"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Skeleton } from "./ui/skeleton"
import { BarChart3 } from "lucide-react"
import { useMeasureEvents, useStatusEvents } from "../hooks/useNeutralizer"
import type { MeasureEvent, Status } from "../types"
import { cn } from "../lib/utils"

const TIME_RANGES = [
  { label: "1h", hours: 1 },
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "7d", hours: 168 },
] as const

const chartConfig = {
  ph: {
    label: "pH",
    color: "var(--chart-1)",
  },
  temperature: {
    label: "Temperature",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

interface ChartDataPoint {
  timestamp: number
  ph?: number
  temperature?: number
}

const STATUS_COLORS: Record<string, { bg: string; text: string; area: string }> = {
  NEUTRALIZING: {
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
    text: "text-emerald-700 dark:text-emerald-300",
    area: "rgba(16, 185, 129, 0.08)",
  },
  IDLE: {
    bg: "bg-zinc-100 dark:bg-zinc-800/50",
    text: "text-zinc-600 dark:text-zinc-400",
    area: "rgba(161, 161, 170, 0.05)",
  },
}

function getStatusColor(status: Status) {
  if (STATUS_COLORS[status]) return STATUS_COLORS[status]
  if (status.startsWith("MANUALLY_")) {
    return {
      bg: "bg-blue-100 dark:bg-blue-900/50",
      text: "text-blue-700 dark:text-blue-300",
      area: "rgba(59, 130, 246, 0.08)",
    }
  }
  // EMPTYING_* / FORCING_*
  return {
    bg: "bg-amber-100 dark:bg-amber-900/50",
    text: "text-amber-700 dark:text-amber-300",
    area: "rgba(245, 158, 11, 0.08)",
  }
}

function getStatusStrokeColor(status: Status): string {
  if (status === "NEUTRALIZING") return "rgba(16, 185, 129, 0.5)"
  if (status === "IDLE") return "rgba(161, 161, 170, 0.3)"
  if (status.startsWith("MANUALLY_")) return "rgba(59, 130, 246, 0.5)"
  return "rgba(245, 158, 11, 0.5)"
}

function formatStatusLabel(status: Status): string {
  return status
    .replace(/_/g, " ")
    .replace(/MANUALLY /g, "")
    .split(" ")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ")
}

function mergeEventsToDataPoints(events: MeasureEvent[]): ChartDataPoint[] {
  const byTimestamp = new Map<number, ChartDataPoint>()

  for (const event of events) {
    const ts = new Date(event.timestamp).getTime()
    const existing = byTimestamp.get(ts) ?? { timestamp: ts }

    if (event.metricName === "ph" || event.metricName === "pH") {
      existing.ph = event.value
    } else if (event.metricName === "temperature") {
      existing.temperature = event.value
    }

    byTimestamp.set(ts, existing)
  }

  return Array.from(byTimestamp.values()).sort((a, b) => a.timestamp - b.timestamp)
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function PhChart() {
  const [rangeIndex, setRangeIndex] = useState(1) // default 6h
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null)

  const range = TIME_RANGES[rangeIndex]
  const endDate = useMemo(() => new Date().toISOString(), [rangeIndex])
  const startDate = useMemo(() => {
    const d = new Date(endDate)
    d.setHours(d.getHours() - range.hours)
    return d.toISOString()
  }, [endDate, range.hours])

  const { data: measureEvents, isLoading: measuresLoading } = useMeasureEvents(startDate, endDate)
  const { data: statusEvents, isLoading: statusLoading } = useStatusEvents(startDate, endDate)

  const isLoading = measuresLoading || statusLoading

  const chartData = useMemo(() => {
    if (!measureEvents?.length) return []
    return mergeEventsToDataPoints(measureEvents)
  }, [measureEvents])

  const statusRegions = useMemo(() => {
    if (!statusEvents?.length || !chartData.length) return []
    const sorted = [...statusEvents].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    const chartEnd = chartData[chartData.length - 1].timestamp

    return sorted.map((event, i) => {
      const start = new Date(event.timestamp).getTime()
      const end = i < sorted.length - 1
        ? new Date(sorted[i + 1].timestamp).getTime()
        : chartEnd
      return { ...event, startTs: start, endTs: end }
    })
  }, [statusEvents, chartData])

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6 space-y-4">
        {/* Header with time range selector */}
        <div className="flex items-center justify-between">
          <SectionHeader
            icon={<BarChart3 className="w-4 h-4" />}
            title="History"
          />
          <div className="flex gap-1">
            {TIME_RANGES.map((r, i) => (
              <Button
                key={r.label}
                variant={i === rangeIndex ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setRangeIndex(i)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="timestamp"
                type="number"
                domain={["dataMin", "dataMax"]}
                scale="time"
                tickFormatter={formatTime}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                yAxisId="ph"
                domain={[0, 14]}
                tickLine={false}
                axisLine={false}
                label={{ value: "pH", angle: -90, position: "insideLeft", offset: 16, style: { fontSize: 11 } }}
              />

              <YAxis
                yAxisId="temp"
                orientation="right"
                tickLine={false}
                axisLine={false}
                label={{ value: "°C", angle: 90, position: "insideRight", offset: 16, style: { fontSize: 11 } }}
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_value, payload) => {
                      if (!payload?.length) return ""
                      const ts = payload[0]?.payload?.timestamp
                      return ts ? formatDateTime(ts) : ""
                    }}
                  />
                }
              />

              {/* Activity regions */}
              {statusRegions.map((region, i) => (
                <ReferenceArea
                  key={i}
                  yAxisId="ph"
                  x1={region.startTs}
                  x2={region.endTs}
                  fill={getStatusColor(region.status).area}
                  fillOpacity={hoveredEvent === i ? 1.5 : 1}
                />
              ))}

              {/* Status change reference lines */}
              {statusEvents?.map((event, i) => {
                const ts = new Date(event.timestamp).getTime()
                return (
                  <ReferenceLine
                    key={`line-${i}`}
                    yAxisId="ph"
                    x={ts}
                    stroke={getStatusStrokeColor(event.status)}
                    strokeDasharray="4 4"
                    strokeWidth={hoveredEvent === i ? 2 : 1}
                  />
                )
              })}

              <Line
                yAxisId="ph"
                type="monotone"
                dataKey="ph"
                stroke="var(--color-ph)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />

              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="temperature"
                stroke="var(--color-temperature)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
            No data available for this time range
          </div>
        )}

        {/* Activity chips timeline */}
        {statusEvents && statusEvents.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {statusEvents.map((event, i) => {
              const colors = getStatusColor(event.status)
              return (
                <Badge
                  key={i}
                  variant="outline"
                  className={cn(
                    "cursor-default text-[10px] px-2 py-0.5 border-transparent transition-all",
                    colors.bg,
                    colors.text,
                    hoveredEvent === i && "ring-2 ring-ring"
                  )}
                  onMouseEnter={() => setHoveredEvent(i)}
                  onMouseLeave={() => setHoveredEvent(null)}
                  title={`${formatDateTime(new Date(event.timestamp).getTime())} — ${event.status}`}
                >
                  {formatStatusLabel(event.status)}
                  <span className="ml-1 opacity-60">
                    {formatTime(new Date(event.timestamp).getTime())}
                  </span>
                </Badge>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      {icon}
      {title}
    </div>
  )
}
