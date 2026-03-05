import {
  useHardwareStatus,
  useSynchronizeTime,
  useUsages,
} from "../hooks/useNeutralizer"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Skeleton } from "./ui/skeleton"
import type { UsageDto } from "../types"
import {
  Cpu,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  Hash,
  Radio,
  Gauge,
  Activity,
  CheckCircle,
  XCircle,
  Thermometer,
  MemoryStick,
  Droplets,
  FlaskConical,
} from "lucide-react"

const RELAY_LABELS = [
  "Acid Pump",
  "Agitation",
  "Tank 1 Drain",
  "Tank 2 Drain",
  "Neutralizer Drain",
  "Relay 6",
  "Relay 7",
  "Relay 8",
]

const CATEGORY_COLORS: Record<string, string> = {
  SENSOR: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  ACTUATOR: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
  COMPUTE: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  CLOCK: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
}

const USAGE_TYPE_ICONS: Record<string, React.ReactNode> = {
  PHMETER: <FlaskConical className="w-4 h-4" />,
  THERMOMETER: <Thermometer className="w-4 h-4" />,
  MEMORYMETER: <MemoryStick className="w-4 h-4" />,
  TANKLEVEL: <Droplets className="w-4 h-4" />,
}

function relayBits(relayStatus: number): boolean[] {
  return Array.from({ length: 8 }, (_, i) => Boolean((relayStatus >> i) & 1))
}

function HardwareSkeleton() {
  return (
    <div className="space-y-6 p-6 md:p-8 lg:p-10">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}

function InfoRow({ label, value, icon }: { label: string; value?: string | number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <span className="text-sm font-medium tabular-nums">{value ?? "--"}</span>
    </div>
  )
}

function UsageCard({ usage }: { usage: UsageDto }) {
  const icon = usage.usageType ? USAGE_TYPE_ICONS[usage.usageType] : <Cpu className="w-4 h-4" />
  const colorClass = CATEGORY_COLORS[usage.category] ?? "bg-muted text-muted-foreground"

  return (
    <div className="flex flex-col gap-2 rounded-xl border px-4 py-3 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          {icon}
          <span>{usage.name}</span>
        </div>
        <Badge className={`text-xs ${colorClass}`} variant="outline">
          {usage.usageType ?? usage.category}
        </Badge>
      </div>
      <div className="text-xs text-muted-foreground space-y-0.5">
        <p>{usage.componentModelName} · {usage.componentSerialNumber}</p>
        {usage.metricName && (
          <p>Metric: <span className="font-medium text-foreground">{usage.metricName}</span>
            {usage.unit && <span> ({usage.unit})</span>}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className={`flex items-center gap-1 ${usage.accessible ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
          {usage.accessible
            ? <CheckCircle className="w-3.5 h-3.5" />
            : <XCircle className="w-3.5 h-3.5" />}
          Accessible
        </span>
        {usage.installed !== undefined && (
          <span className={`flex items-center gap-1 ${usage.installed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
            {usage.installed
              ? <CheckCircle className="w-3.5 h-3.5" />
              : <XCircle className="w-3.5 h-3.5" />}
            Installed
          </span>
        )}
      </div>
    </div>
  )
}

export function HardwarePage() {
  const { data: hardware, isLoading, error, refetch, isFetching } = useHardwareStatus()
  const { data: usagesResponse } = useUsages()
  const syncTime = useSynchronizeTime()

  if (isLoading) return <HardwareSkeleton />

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-8">
        <Card className="rounded-2xl border-red-200 dark:border-red-900 max-w-md w-full">
          <CardContent className="p-6 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
              <WifiOff className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <p className="font-semibold text-lg">Connection Error</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )

  const hw = hardware?.data
  const isConnected = hw?.connected
  const relays = hw !== undefined ? relayBits(hw.relayStatus) : []
  const activeRelayCount = relays.filter(Boolean).length
  const usages = usagesResponse?.data ?? []

  return (
    <div className="space-y-8 p-6 md:p-8 lg:p-10">
      {/* HEADER */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hardware</h1>
          <p className="text-sm text-muted-foreground">
            Connection status and component usage
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* CONNECTION STATUS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              isConnected
                ? "bg-emerald-100 dark:bg-emerald-950/50"
                : "bg-red-100 dark:bg-red-950/50"
            }`}>
              {isConnected
                ? <Wifi className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                : <WifiOff className="w-6 h-6 text-red-600 dark:text-red-400" />}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Connection</p>
              <p className={`text-lg font-semibold ${
                isConnected
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-red-700 dark:text-red-300"
              }`}>
                {isConnected ? "Connected" : "Disconnected"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Relays</p>
              <p className="text-lg font-semibold">
                {activeRelayCount} <span className="text-sm font-normal text-muted-foreground">/ 8</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/50">
              <Cpu className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Firmware</p>
              <p className="text-lg font-semibold">{hw?.firmwareVersion ?? "--"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HARDWARE DETAILS */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Connection Details
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <InfoRow label="Port" value={hw?.portName} icon={<Radio className="w-4 h-4" />} />
          <InfoRow label="Baudrate" value={hw?.baudrate?.toLocaleString()} icon={<Gauge className="w-4 h-4" />} />
          <InfoRow label="Slave ID" value={hw?.slaveId} icon={<Hash className="w-4 h-4" />} />
          <InfoRow label="Device Time" value={hw?.deviceTime} icon={<Clock className="w-4 h-4" />} />
          <InfoRow
            label="Relay Status (raw)"
            value={hw !== undefined ? `0x${hw.relayStatus.toString(16).toUpperCase().padStart(2, "0")} (${hw.relayStatus})` : undefined}
            icon={<Activity className="w-4 h-4" />}
          />
          <div className="pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => syncTime.mutate()}
              disabled={syncTime.isPending || !isConnected}
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${syncTime.isPending ? "animate-spin" : ""}`} />
              Sync Device Time
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RELAY STATUS */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Relay Status
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RELAY_LABELS.map((label, i) => {
              const active = relays[i] ?? false
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                    active
                      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div>
                    <p className="text-xs text-muted-foreground">Relay {i + 1}</p>
                    <p className="text-sm font-medium">{label}</p>
                  </div>
                  <Badge
                    variant={active ? "default" : "secondary"}
                    className={active
                      ? "bg-emerald-500 hover:bg-emerald-500 text-white"
                      : ""}
                  >
                    {active ? "ON" : "OFF"}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* COMPONENT USAGES */}
      {usages.length > 0 && (
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Component Usages
              <Badge variant="secondary" className="ml-auto">{usages.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {usages.map((usage) => (
                <UsageCard key={usage.id} usage={usage} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
