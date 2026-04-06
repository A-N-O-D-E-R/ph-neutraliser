import { Activity, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent } from "../ui/card"
import { UsageDto } from "../../types";

export function ConnectionStatusCard({ isConnected }: { isConnected: boolean }) {
    return (
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
        </Card>);
}


export function ActiveSensorsCard({ usages }: { usages: UsageDto[] }) {
    const sensors = usages.filter(usage => usage.category === "SENSOR")
    const activeSensors = sensors.filter(usage => usage.installed).length
    return (
         <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Sensors</p>
              <p className="text-lg font-semibold">
                {activeSensors} <span className="text-sm font-normal text-muted-foreground">/ {sensors.length} </span>
              </p>
            </div>
          </CardContent>
        </Card>
        );
}