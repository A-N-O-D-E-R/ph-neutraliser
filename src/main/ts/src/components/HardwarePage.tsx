import {
  useHardwareStatus,
  useMeasureEvents,
  useUsages,
} from "../hooks/useNeutralizer"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { HardwareSkeleton } from "./hardware/HardwareSkeleton"
import type { HardwareStatus } from "../types"
import {Cpu, RefreshCw} from "lucide-react"
import { HardwareDetails } from "./hardware/HardwareDetails"
import RelayStatus from "./hardware/RelayStatus"
import SensorUsageList from "./hardware/SensorUsageList"
import { ActiveSensorsCard, ConnectionStatusCard } from "./hardware/ConnectionSatusCard"
import NetworkConnectionErrorCard from "./NetworkConnectionErrorCard"

// This comes from the embedded firmware and should ideally be retrieved from the API, but for now we hardcode it here for display purposes
const RELAY_LABELS = [
  "WasteTank 1 Drain",
  "WasteTank 2 Drain",
  "Neutralizer Drain",
  "Acid Pump",
  "Agitation",
]

function relayBits(relayStatus: number): boolean[] {
  return Array.from({ length: 8 }, (_, i) => Boolean((relayStatus >> i) & 1))
}

export function HardwarePage() {
  const { data: hardware, isLoading, error, refetch, isFetching } = useHardwareStatus()
  const { data: usagesResponse } = useUsages()
  const { data: measureEvents } = useMeasureEvents()


  if (isLoading) return <HardwareSkeleton />

  if (error)
    return (
     <div className="flex items-center justify-center min-h-[50vh] p-8">
        <NetworkConnectionErrorCard error={error} refetch={refetch} />
      </div>
    )

  const hw = hardware?.data
  const isConnected = hw?.connected
  const relays = hw !== undefined ? relayBits(hw.relayStatus) : []
  const usages = usagesResponse?.data ?? []
  const sensors = usages.filter(usage => usage.category === "SENSOR")

  return (
    <div className="space-y-8 p-6 md:p-8 lg:p-10">
      <HardwareHeader refetch={refetch} isFetching={isFetching} />
      <div className="grid gap-4 sm:grid-cols-3">
        {isConnected && <ConnectionStatusCard isConnected={isConnected} />}
        <ActiveSensorsCard usages={sensors} />
        {hw && (<FirmwareVersion hw={hw} />)}
      </div>
      {measureEvents && (<SensorUsageList sensors={sensors} measureEvents={measureEvents} />)}
      {relays && (<RelayStatus relays={relays} relayLabel={RELAY_LABELS} />)}
      {hw ? <HardwareDetails hardware={hw} /> : <></>}
    </div>
  )
}


function HardwareHeader({refetch, isFetching}: { refetch: () => void, isFetching: boolean }) {
  return (<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
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
      </div>);
}


function FirmwareVersion({ hw }: { hw: HardwareStatus }) {
    return (
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
        );
}