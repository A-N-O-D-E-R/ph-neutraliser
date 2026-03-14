import { Gauge, Play, Settings2, Wifi, WifiOff } from "lucide-react";
import { StatusCard } from "../card/StatusCard";
import { HardwareStatus, NeutralizerStatus } from "@/types";


export default function StatusSection({status, hardware}:{status: NeutralizerStatus, hardware : HardwareStatus}){
    const isIdle = status?.status === "IDLE"
    const isConnected = hardware?.connected
    const isAutomatic = status?.runningMode === "AUTOMATIC"
    return (<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatusCard
            label="Running Mode"
            value={status?.runningMode ?? "UNKNOWN"}
            level={isAutomatic ? "OK" : "INFO"}
            icon={isAutomatic ? <Play className="w-5 h-5" /> : <Settings2 className="w-5 h-5" />}
          />
          <StatusCard
            label="System Status"
            value={formatStatus(status?.status)}
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
        </div>);
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