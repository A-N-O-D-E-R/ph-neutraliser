import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import {Activity,} from "lucide-react"

export default function RelayStatus({ relays ,relayLabel }: { relays: boolean[] , relayLabel:  string[] }) {
    
    return(<Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Relay Status
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {relayLabel.map((label, i) => {
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
      </Card>);
}