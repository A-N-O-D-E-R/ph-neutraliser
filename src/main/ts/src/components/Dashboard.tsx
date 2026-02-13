import { useState } from "react"
import {
  useStatus,
  useStartAutomatic,
  useStopAutomatic,
  useTriggerNeutralization,
  useEmptyTank1,
  useEmptyTank2,
  useEmptyNeutralizer,
  useActivateAcidPump,
  useActivateAgitation,
  useHardwareStatus,
  useSynchronizeTime,
} from "../hooks/useNeutralizer"

import { StatusCard } from "./StatusCard"
import { Card, CardContent} from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Separator } from "./ui/separator"
import { Skeleton } from "./ui/skeleton"
import {
  Activity,
  Beaker,
  Cpu,
  Droplets,
  FlaskConical,
  Gauge,
  Play,
  Power,
  RefreshCw,
  Settings2,
  Square,
  Target,
  Thermometer,
  Timer,
  Trash2,
  Waves,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react"

function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6 md:p-8 lg:p-10">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-2xl" />
      <Skeleton className="h-52 rounded-2xl" />
    </div>
  )
}

export function Dashboard() {
  const { data: status, isLoading, error } = useStatus()
  const { data: hardware } = useHardwareStatus()
  const [duration, setDuration] = useState(60)

  const startAuto = useStartAutomatic()
  const stopAuto = useStopAutomatic()
  const triggerNeutralization = useTriggerNeutralization()
  const emptyTank1 = useEmptyTank1()
  const emptyTank2 = useEmptyTank2()
  const emptyNeutralizer = useEmptyNeutralizer()
  const acidPump = useActivateAcidPump()
  const agitation = useActivateAgitation()
  const syncTime = useSynchronizeTime()

  if (isLoading) return <DashboardSkeleton />
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
          </CardContent>
        </Card>
      </div>
    )
  if (!status) return null

  const isAutomatic = status.data?.runningMode === "AUTOMATIC"
  const isIdle = status.data?.status === "IDLE"
  const isConnected = hardware?.data?.connected

  return (
    <div className="space-y-12 p-6 md:p-8 lg:p-10">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor and control your pH neutralization system
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live
        </div>
      </div>

      {/* SYSTEM STATUS */}
      <section className="space-y-3">
        <SectionHeader icon={<Activity className="w-4 h-4" />} title="System Status" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatusCard
            label="Running Mode"
            value={status.data?.runningMode ?? "UNKNOWN"}
            level={isAutomatic ? "OK" : "INFO"}
            icon={isAutomatic ? <Play className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
          />
          <StatusCard
            label="System Status"
            value={formatStatus(status.data?.status)}
            level={isIdle ? "INFO" : "OK"}
            icon={<Gauge className="w-5 h-5" />}
          />
          {hardware && (
            <StatusCard
              label="Hardware"
              value={isConnected ? "Connected" : "Disconnected"}
              level={isConnected ? "OK" : "ERROR"}
              icon={isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            />
          )}
        </div>
      </section>

      {/* MEASUREMENTS */}
      <section className="space-y-3">
        <SectionHeader icon={<Beaker className="w-4 h-4" />} title="Measurements" />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <StatusCard
            label="Current pH"
            value={status.data?.currentPh?.toFixed(2) ?? "--"}
            icon={<FlaskConical className="w-5 h-5" />}
          />
          <StatusCard
            label="Target pH"
            value={status.data?.targetPh?.toFixed(2) ?? "--"}
            icon={<Target className="w-5 h-5" />}
          />
          <StatusCard
            label="Temperature"
            value={status.data?.temperature?.toFixed(1) ?? "--"}
            unit="°C"
            icon={<Thermometer className="w-5 h-5" />}
          />
          <StatusCard
            label="Acid Level"
            value={status.data?.acidLevel ?? "UNKNOWN"}
            level={status.data?.acidLevel === "FULL" ? "ERROR" : "OK"}
            icon={<Droplets className="w-5 h-5" />}
          />
          <StatusCard
            label="Neutralizer"
            value={status.data?.neutralizerLevel ?? "UNKNOWN"}
            level={status.data?.neutralizerLevel === "FULL" ? "ERROR" : "OK"}
            icon={<Beaker className="w-5 h-5" />}
          />
          <StatusCard
            label="Waste Tank"
            value={status.data?.wasteLevel ?? "UNKNOWN"}
            level={status.data?.wasteLevel === "FULL" ? "ERROR" : "OK"}
            icon={<Trash2 className="w-5 h-5" />}
          />
        </div>
      </section>

      {/* MODE CONTROL */}
      <section className="space-y-3">
        <SectionHeader icon={<Power className="w-4 h-4" />} title="Mode Control" />
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isAutomatic
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <Play className="w-4 h-4" />
                  Automatic
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  !isAutomatic
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <Settings2 className="w-4 h-4" />
                  Manual
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => startAuto.mutate()}
                  disabled={isAutomatic || startAuto.isPending}
                >
                  <Play className="w-4 h-4 mr-1.5" />
                  Start Automatic
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => stopAuto.mutate()}
                  disabled={!isAutomatic || stopAuto.isPending}
                >
                  <Square className="w-4 h-4 mr-1.5" />
                  Stop Automatic
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => triggerNeutralization.mutate()}
                  disabled={triggerNeutralization.isPending}
                >
                  <Zap className="w-4 h-4 mr-1.5" />
                  Trigger Neutralization
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* MANUAL CONTROLS */}
      <section className="space-y-3">
        <SectionHeader icon={<Settings2 className="w-4 h-4" />} title="Manual Controls" />
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <Timer className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-medium">Duration</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-24 h-9"
                min={1}
              />
              <span className="text-sm text-muted-foreground">seconds</span>
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => emptyTank1.mutate({ duration })}
                disabled={emptyTank1.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Empty Tank 1</div>
                  <div className="text-xs text-muted-foreground">{duration}s</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => emptyTank2.mutate({ duration })}
                disabled={emptyTank2.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Empty Tank 2</div>
                  <div className="text-xs text-muted-foreground">{duration}s</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => emptyNeutralizer.mutate({ duration })}
                disabled={emptyNeutralizer.isPending}
              >
                <Beaker className="w-4 h-4 mr-2 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Empty Neutralizer</div>
                  <div className="text-xs text-muted-foreground">{duration}s</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => acidPump.mutate({ duration })}
                disabled={acidPump.isPending}
              >
                <Droplets className="w-4 h-4 mr-2 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Acid Pump</div>
                  <div className="text-xs text-muted-foreground">{duration}s</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => agitation.mutate({ duration })}
                disabled={agitation.isPending}
              >
                <Waves className="w-4 h-4 mr-2 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Agitation</div>
                  <div className="text-xs text-muted-foreground">{duration}s</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* HARDWARE */}
      {hardware && (
        <section className="space-y-3">
          <SectionHeader icon={<Cpu className="w-4 h-4" />} title="Hardware" />
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:flex sm:gap-6">
                  <HardwareDetail label="Port" value={hardware.data?.portName} />
                  <HardwareDetail label="Baudrate" value={hardware.data?.baudrate?.toLocaleString()} />
                  <HardwareDetail label="Slave ID" value={hardware.data?.slaveId} />
                  <HardwareDetail label="Firmware" value={hardware.data?.firmwareVersion} />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncTime.mutate()}
                  disabled={syncTime.isPending}
                >
                  <RefreshCw className={`w-4 h-4 mr-1.5 ${syncTime.isPending ? "animate-spin" : ""}`} />
                  Sync Time
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
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

function HardwareDetail({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "--"}</p>
    </div>
  )
}

function formatStatus(status?: string): string {
  if (!status) return "UNKNOWN"
  return status
    .replace(/_/g, " ")
    .replace(/MANUALLY /g, "")
    .split(" ")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ")
}
