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
  useHardwareStatus
} from "../hooks/useNeutralizer"
import { Skeleton } from "./ui/skeleton"
import {
  Activity,
  Beaker,
  Power,
  Settings2,
} from "lucide-react"
import { MeasureChart } from "./MeasureChart"
import NetworkConnectionErrorCard from "./NetworkConnectionErrorCard"
import MesurementsSection from "./dashboard/MeasurementsSection"
import StatusSection from "./dashboard/StatusSection"
import { HardwareDetails } from "./hardware/HardwareDetails"
import ModeControl from "./dashboard/ModeControl"
import ManualControls from "./dashboard/ManualControls"

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
  const { mutate: startAutomatic, isPending: isStarting } = useStartAutomatic()
  const { mutate: stopAutomatic, isPending: isStopping } = useStopAutomatic()
  const { mutate: triggerNeutralization, isPending: isNeutralizationPending } = useTriggerNeutralization();
  const { mutate: emptyTank1, isPending: isEmptyTank1Pending } = useEmptyTank1()
  const { mutate: emptyTank2, isPending: isEmptyTank2Pending } = useEmptyTank2()
  const { mutate: emptyNeutralizer, isPending: isEmptyNeutralizerPending } = useEmptyNeutralizer()
  const { mutate: acidPump, isPending: isAcidPumpPending } = useActivateAcidPump()
  const { mutate: agitation, isPending: isAgitationPending } = useActivateAgitation()

  if (isLoading) return <DashboardSkeleton />
  if (error)
    return NetworkConnectionErrorCard({ error })
  if (!status) return null

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

      {/* MEASUREMENTS */}
      {status.data && (
        <section className="space-y-3">
          <SectionHeader icon={<Beaker className="w-4 h-4" />} title="Measurements" />
          <MesurementsSection status={status.data}/>
        </section>
      )}


      <section className="space-y-3">
        <MeasureChart />
      </section>

      {status.data && hardware?.data && (
        <section className="space-y-3">
          <SectionHeader icon={<Activity className="w-4 h-4" />} title="System Status" />
          <StatusSection status={status.data} hardware={hardware?.data} />
        </section>
      )}

      {/* MODE CONTROL */}
      {status.data &&(<section className="space-y-3">
        <SectionHeader icon={<Power className="w-4 h-4" />} title="Mode Control" />
        <ModeControl 
          status={status.data}
          onStartAuto={startAutomatic}
          onStopAuto={stopAutomatic}
          onTriggerNeutralization={triggerNeutralization} 
          isStartPending={isStarting} 
          isStopPending={isStopping} 
          isNeutralizationPending={isNeutralizationPending}          
          />
      </section>)}

      {/* MANUAL CONTROLS */}
      <section className="space-y-3">
        <SectionHeader icon={<Settings2 className="w-4 h-4" />} title="Manual Controls" />
        <ManualControls
          onEmptyTank1={emptyTank1}
          onEmptyTank2={emptyTank2}
          onEmptyNeutralizer={emptyNeutralizer}
          onActivateAcidPump={acidPump}
          onActivateAgitation={agitation}
          isEmptyTank1Pending={isEmptyTank1Pending}
          isEmptyTank2Pending={isEmptyTank2Pending}
          isEmptyNeutralizerPending={isEmptyNeutralizerPending}
          isAcidPumpPending={isAcidPumpPending}
          isAgitationPending={isAgitationPending}
        />
      </section>

      {/* HARDWARE */}
      {hardware?.data &&(<HardwareDetails hardware={hardware.data} />)}
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



