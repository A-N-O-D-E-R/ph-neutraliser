import { useState } from "react"
import { useUpdateUsageConnection, useDeleteSensor, useModbusConnections } from "../../hooks/useNeutralizer"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog"
import type { MeasureEvent, UsageDto } from "../../types"
import {
  Cpu,
  Hash,
  Radio,
  Gauge,
  CheckCircle,
  XCircle,
  Thermometer,
  MemoryStick,
  Droplets,
  FlaskConical,
  Trash2,
} from "lucide-react"

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

export function UsageCard({ usage, lastMeasure }: { usage: UsageDto; lastMeasure?: MeasureEvent }) {
  const icon = usage.usageType ? USAGE_TYPE_ICONS[usage.usageType] : <Cpu className="w-4 h-4" />
  const colorClass = CATEGORY_COLORS[usage.category] ?? "bg-muted text-muted-foreground"
  const [dialogOpen, setDialogOpen] = useState(false)
  const [portName, setPortName] = useState(usage.portName ?? "")
  const [slaveId, setSlaveId] = useState(String(usage.slaveId ?? ""))
  const [offset, setOffset] = useState(String(usage.offset ?? ""))
  const [poolName, setPoolName] = useState(usage.poolName ?? "")
  const updateConnection = useUpdateUsageConnection()
  const deleteSensor = useDeleteSensor()
  const { data: modbusConnections } = useModbusConnections()
  const connectionOptions = modbusConnections?.data ?? []

  const connectionType = usage.connectionType
  const hasConnectionParams = connectionType !== undefined

  function handleSave() {
    const req = connectionType === "SYSTEM"
      ? { poolName: poolName || undefined }
      : {
          portName: portName || undefined,
          slaveId: slaveId !== "" ? Number(slaveId) : undefined,
          offset: offset !== "" ? Number(offset) : undefined,
        }
    updateConnection.mutate(
      { id: usage.id, req },
      { onSuccess: () => setDialogOpen(false) }
    )
  }

  return (
    <>
      <div
        className="flex flex-col gap-2 rounded-xl border px-4 py-3 bg-card cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setDialogOpen(true)}
      >
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
        {lastMeasure && (
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-1.5 text-xs">
            <span className="text-muted-foreground">Last measure</span>
            <span className="font-semibold tabular-nums text-foreground">
              {lastMeasure.value} <span className="font-normal text-muted-foreground">{lastMeasure.unit}</span>
            </span>
          </div>
        )}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {icon}
              {usage.name}
            </DialogTitle>
          </DialogHeader>
          {hasConnectionParams ? (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Connection type</span>
                <Badge variant="outline" className="text-xs">
                  {connectionType === "MODBUS" ? <Radio className="w-3 h-3 mr-1" /> : <Cpu className="w-3 h-3 mr-1" />}
                  {connectionType}
                </Badge>
              </div>
              {connectionType === "SYSTEM" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" /> Pool Name
                  </label>
                  <Input
                    value={poolName}
                    onChange={(e) => setPoolName(e.target.value)}
                    placeholder="pool-name"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5" /> Port
                    </label>
                    <Select value={portName} onValueChange={setPortName}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a connection" />
                      </SelectTrigger>
                      <SelectContent>
                        {connectionOptions.map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" /> Slave ID
                    </label>
                    <Input
                      type="number"
                      value={slaveId}
                      onChange={(e) => setSlaveId(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5" /> Offset
                    </label>
                    <Input
                      type="number"
                      value={offset}
                      onChange={(e) => setOffset(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">No connection parameters available for this sensor.</p>
          )}
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => deleteSensor.mutate(usage.id, { onSuccess: () => setDialogOpen(false) })}
              disabled={deleteSensor.isPending}
              className="mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              {deleteSensor.isPending ? "Deleting…" : "Delete"}
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            {hasConnectionParams && (
              <Button onClick={handleSave} disabled={updateConnection.isPending}>
                {updateConnection.isPending ? "Saving…" : "Save"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
