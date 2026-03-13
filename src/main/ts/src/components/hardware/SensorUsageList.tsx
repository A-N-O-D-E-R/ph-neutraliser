import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Cpu } from "lucide-react"
import { UsageCard } from "./UsageCard"
import { AddSensorCard } from "./AddSensorCard"
import { MeasureEvent, UsageDto } from "@/types"

export default function SensorUsageList({ sensors, measureEvents }: { sensors: UsageDto[]; measureEvents: MeasureEvent[]}) {
    const lastMeasureByMetric = (measureEvents ?? []).reduce<Record<string, MeasureEvent>>((acc, event) => {
        const existing = acc[event.metricName]
        if (!existing || event.timestamp > existing.timestamp) {
          acc[event.metricName] = event
        }
        return acc
    }, {})
    
    return (
        <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            Sensors Usages
            <Badge variant="secondary" className="ml-auto">{sensors.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sensors.map((sensor) => (
              <UsageCard
                key={sensor.id}
                usage={sensor}
                lastMeasure={sensor.metricName ? lastMeasureByMetric[sensor.metricName] : undefined}
              />
            ))}
            <AddSensorCard />
          </div>
        </CardContent>
      </Card>
    );
}