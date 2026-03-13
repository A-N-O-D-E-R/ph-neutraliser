import { Play, Settings2, Square, Zap } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator"

import { NeutralizerStatus } from "@/types";
export default function ModeControl({ status, onStartAuto, onStopAuto, onTriggerNeutralization, isStartPending, isStopPending, isNeutralizationPending }: { status: NeutralizerStatus | undefined, onStartAuto: () => void, onStopAuto: () => void, onTriggerNeutralization: () => void, isStartPending: boolean, isStopPending: boolean, isNeutralizationPending: boolean}) {
    const isAutomatic = status?.runningMode === "AUTOMATIC"
    return (
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
                  onClick={onStartAuto}
                  disabled={isAutomatic || isStartPending}
                >
                  <Play className="w-4 h-4 mr-1.5" />
                  Start Automatic
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onStopAuto}
                  disabled={!isAutomatic || isStopPending}
                >
                <Square className="w-4 h-4 mr-1.5" />
                  Stop Automatic
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onTriggerNeutralization}
                  disabled={isNeutralizationPending}
                >
                <Zap className="w-4 h-4 mr-1.5" />
                  Trigger Neutralization
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>);
}