import { Card, CardContent} from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Beaker,
  Droplets,
  Timer,
  Trash2,
  Waves,
} from "lucide-react"
import { Separator } from "../ui/separator"
import { useState } from "react"
import { ActionWithDuration } from "../../types"

type ManualControlsProps = {
  onEmptyTank1: ActionWithDuration
  onEmptyTank2: ActionWithDuration
  onEmptyNeutralizer: ActionWithDuration
  onActivateAcidPump: ActionWithDuration
  onActivateAgitation: ActionWithDuration
  isEmptyTank1Pending?: boolean
  isEmptyTank2Pending?: boolean
  isEmptyNeutralizerPending?: boolean
  isAcidPumpPending?: boolean
  isAgitationPending?: boolean
}

export default function ManualControls({
    onEmptyTank1,
    onEmptyTank2,
    onEmptyNeutralizer,
    onActivateAcidPump,
    onActivateAgitation,
    isEmptyTank1Pending,
    isEmptyTank2Pending,
    isEmptyNeutralizerPending,
    isAcidPumpPending,
    isAgitationPending
    }: ManualControlsProps){
    const [duration, setDuration] = useState(60)
    return (
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <Timer className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-medium">Duration</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-24 h-9"
                min={1}
              />
              <span className="text-sm text-muted-foreground">seconds</span>
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => onEmptyTank1({ duration })}
                disabled={isEmptyTank1Pending}
              >
                <Trash2 className="w-4 h-4 mr-2 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Empty Tank 1</div>
                  <div className="text-xs text-muted-foreground">{duration}s</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => onEmptyTank2({ duration })}
                disabled={isEmptyTank2Pending}
              >
                <Trash2 className="w-4 h-4 mr-2 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Empty Tank 2</div>
                  <div className="text-xs text-muted-foreground">{duration}s</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => onEmptyNeutralizer({ duration })}
                disabled={isEmptyNeutralizerPending}
              >
                <Beaker className="w-4 h-4 mr-2 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Empty Neutralizer</div>
                  <div className="text-xs text-muted-foreground">{duration}s</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => onActivateAcidPump({ duration })}
                disabled={isAcidPumpPending}
              >
                <Droplets className="w-4 h-4 mr-2 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Acid Pump</div>
                  <div className="text-xs text-muted-foreground">{duration}s</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                onClick={() => onActivateAgitation({ duration })}
                disabled={isAgitationPending}
              >
                <Waves className="w-4 h-4 mr-2 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Agitation</div>
                  <div className="text-xs text-muted-foreground">{duration}s</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
    );
}