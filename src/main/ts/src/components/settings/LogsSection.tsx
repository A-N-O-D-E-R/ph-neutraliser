import { neutralizerApi } from "@/api/client"
import { ExportFormat, LogType, MeasureEvent, NeutralizerEvent } from "@/types"
import { downloadFile, toCSV } from "@/utils/tools"
import React from "react"
import { Card, CardContent } from "../ui/card"
import { Download, FileText } from "lucide-react"
import { Field, SectionHeader, ToggleGroup } from "./Section"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"


export default function ExportLogsSection() {
  const today = new Date().toISOString().slice(0, 10)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)

  const [startDate, setStartDate] = React.useState(thirtyDaysAgo)
  const [endDate, setEndDate] = React.useState(today)
  const [logType, setLogType] = React.useState<LogType>("measures")
  const [format, setFormat] = React.useState<ExportFormat>("csv")
  const [status, setStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle")

  async function handleExport() {
    setStatus("loading")
    try {
      let rows: Record<string, unknown>[]
      const start = startDate || undefined
      const end = endDate || undefined

      if (logType === "measures") {
        const events: MeasureEvent[] = await neutralizerApi.getMeasureEvents(start, end)
        rows = events as unknown as Record<string, unknown>[]
      } else if (logType === "ph") {
        const events: MeasureEvent[] = await neutralizerApi.getPhMeasureEvents(start, end)
        rows = events as unknown as Record<string, unknown>[]
      } else {
        const events: NeutralizerEvent[] = await neutralizerApi.getStatusEvents(start, end)
        rows = events as unknown as Record<string, unknown>[]
      }

      const slug = `${logType}-${startDate}_${endDate}`
      if (format === "json") {
        downloadFile(JSON.stringify(rows, null, 2), `logs-${slug}.json`, "application/json")
      } else {
        downloadFile(toCSV(rows), `logs-${slug}.csv`, "text/csv")
      }
      setStatus("done")
    } catch {
      setStatus("error")
    } finally {
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <Card>
      <SectionHeader
        icon={<FileText className="h-5 w-5" />}
        title="Export Logs"
        description="Download historical sensor and status event data"
      />
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="From">
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} max={endDate || today} />
          </Field>
          <Field label="To">
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} max={today} />
          </Field>
        </div>

        <Field label="Data type">
          <ToggleGroup
            value={logType}
            onChange={setLogType}
            options={[
              { value: "measures", label: "All measures" },
              { value: "ph", label: "pH only" },
              { value: "status", label: "Status events" },
            ]}
          />
        </Field>

        <Field label="Format">
          <ToggleGroup
            value={format}
            onChange={setFormat}
            options={[
              { value: "csv", label: "CSV" },
              { value: "json", label: "JSON" },
            ]}
          />
        </Field>

        <Button
          onClick={handleExport}
          disabled={status === "loading"}
          className={cn(
            "gap-2",
            status === "done" && "bg-green-600 hover:bg-green-600",
            status === "error" && "bg-red-600 hover:bg-red-600",
          )}
        >
          <Download className="h-4 w-4" />
          {status === "loading" ? "Fetching…" : status === "done" ? "Downloaded!" : status === "error" ? "Export failed" : "Export logs"}
        </Button>
      </CardContent>
    </Card>
  )
}
