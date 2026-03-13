import { useState } from "react"
import { useCreateSensor, useModbusConnections } from "../../hooks/useNeutralizer"
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
import type { CreateSensorRequest } from "../../types"
import { Plus, Hash, Radio, Gauge } from "lucide-react"

const SENSOR_TYPES = [
  { value: "PHMETER", label: "pH Meter", defaultMetric: "PH", defaultUnit: "pH" },
  { value: "THERMOMETER", label: "Thermometer", defaultMetric: "TEMPERATURE", defaultUnit: "°C" },
  { value: "TANKLEVEL", label: "Tank Level", defaultMetric: "TANK_LEVEL", defaultUnit: "" },
  { value: "MEMORYMETER", label: "Memory Meter", defaultMetric: "MEMORY", defaultUnit: "bytes" },
]

export function AddSensorCard() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [usageType, setUsageType] = useState("PHMETER")
  const [modelName, setModelName] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  const [metricName, setMetricName] = useState("PH")
  const [connectionType, setConnectionType] = useState<"MODBUS" | "SYSTEM">("MODBUS")
  const [portName, setPortName] = useState("")
  const [slaveId, setSlaveId] = useState("")
  const [offset, setOffset] = useState("")
  const [poolName, setPoolName] = useState("")

  const createSensor = useCreateSensor()
  const { data: modbusConnections } = useModbusConnections()
  const connectionOptions = modbusConnections?.data ?? []

  function handleTypeChange(type: string) {
    setUsageType(type)
    const def = SENSOR_TYPES.find(t => t.value === type)
    if (def) setMetricName(def.defaultMetric)
  }

  function handleOpen() {
    setUsageType("PHMETER")
    setModelName("")
    setSerialNumber("")
    setMetricName("PH")
    setConnectionType("MODBUS")
    setPortName("")
    setSlaveId("")
    setOffset("")
    setPoolName("")
    setDialogOpen(true)
  }

  function handleSave() {
    const req: CreateSensorRequest = {
      usageType,
      modelName,
      serialNumber,
      metricName: metricName || undefined,
      connectionType,
      portName: connectionType === "MODBUS" ? portName || undefined : undefined,
      slaveId: connectionType === "MODBUS" && slaveId !== "" ? Number(slaveId) : undefined,
      offset: connectionType === "MODBUS" && offset !== "" ? Number(offset) : undefined,
      poolName: connectionType === "SYSTEM" ? poolName || undefined : undefined,
    }
    createSensor.mutate(req, { onSuccess: () => setDialogOpen(false) })
  }

  const isValid = modelName.trim() !== "" && serialNumber.trim() !== ""

  return (
    <>
      <div
        onClick={handleOpen}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-6 text-muted-foreground cursor-pointer hover:border-primary hover:text-primary hover:bg-muted/20 transition-colors min-h-[120px]"
      >
        <Plus className="w-6 h-6" />
        <span className="text-sm font-medium">Add Sensor</span>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Declare New Sensor
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Sensor Type</label>
              <Select value={usageType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SENSOR_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Model Name</label>
              <Input
                value={modelName}
                onChange={e => setModelName(e.target.value)}
                placeholder="e.g. Atlas Scientific EZO-PH"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Serial Number</label>
              <Input
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                placeholder="e.g. SN-001"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Metric Name</label>
              <Input
                value={metricName}
                onChange={e => setMetricName(e.target.value)}
                placeholder="e.g. PH"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Connection Type</label>
              <Select value={connectionType} onValueChange={v => setConnectionType(v as "MODBUS" | "SYSTEM")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MODBUS">Modbus RTU</SelectItem>
                  <SelectItem value="SYSTEM">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {connectionType === "MODBUS" ? (
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
                      {connectionOptions.map(name => (
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
                    onChange={e => setSlaveId(e.target.value)}
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
                    onChange={e => setOffset(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> Pool Name
                </label>
                <Input
                  value={poolName}
                  onChange={e => setPoolName(e.target.value)}
                  placeholder="pool-name"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!isValid || createSensor.isPending}>
              {createSensor.isPending ? "Saving…" : "Add Sensor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
