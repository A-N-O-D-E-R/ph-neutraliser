import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { InfoRow } from "../hardware/InfoRow"
import {
  Cpu,
  RefreshCw,
  Clock,
  Hash,
  Radio,
  Gauge,
  Activity,
} from "lucide-react"
import { useRestartSensorMonitor, useSynchronizeTime } from "../../hooks/useNeutralizer"
import { HardwareStatus } from "@/types"

export function HardwareDetails({ hardware }: { hardware: HardwareStatus }) {
    const syncTime = useSynchronizeTime()
    const restartSensorMonitor = useRestartSensorMonitor()
    const isConnected = hardware?.connected
    return (
        <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Connection Details
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <InfoRow label="Port" value={hardware?.portName} icon={<Radio className="w-4 h-4" />} />
          <InfoRow label="Baudrate" value={hardware?.baudrate?.toLocaleString()} icon={<Gauge className="w-4 h-4" />} />
          <InfoRow label="Slave ID" value={hardware?.slaveId} icon={<Hash className="w-4 h-4" />} />
          <InfoRow label="Device Time" value={hardware?.deviceTime} icon={<Clock className="w-4 h-4" />} />
          <InfoRow
            label="Relay Status (raw)"
            value={hardware !== undefined ? `0x${hardware.relayStatus.toString(16).toUpperCase().padStart(2, "0")} (${hardware.relayStatus})` : undefined}
            icon={<Activity className="w-4 h-4" />}
          />
          <div className="pt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => syncTime.mutate()}
              disabled={syncTime.isPending || !isConnected}
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${syncTime.isPending ? "animate-spin" : ""}`} />
              Sync Device Time
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => restartSensorMonitor.mutate()}
              disabled={restartSensorMonitor.isPending}
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${restartSensorMonitor.isPending ? "animate-spin" : ""}`} />
              {restartSensorMonitor.isPending ? "Restarting…" : "Restart Sensor Monitor"}
            </Button>
          </div>
        </CardContent>
      </Card>);
      
    }