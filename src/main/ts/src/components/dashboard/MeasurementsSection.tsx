import { Beaker, Droplets, FlaskConical, Thermometer, Trash2 } from "lucide-react";
import { StatusCard } from "../card/StatusCard";
import { StatusCardWithTarget } from "../card/StatusCardWithTarget";
import { NeutralizerStatus } from "@/types";

export default function MesurementsSection({status}: {status:NeutralizerStatus}){
    return (
         <div className="grid gap-6 lg:grid-cols-2 items-start">
          <div className="space-y-6">
            <StatusCardWithTarget
              label="pH Level"
              current={status?.currentPh}
              target={status?.targetPh}
              icon={<FlaskConical className="w-5 h-5" />}
            />

            <StatusCard
              label="Temperature"
              value={status?.temperature?.toFixed(1) ?? "--"}
              unit="°C"
              icon={<Thermometer className="w-5 h-5" />}
            />
          </div>

          {/* RIGHT COLUMN – TANKS */}
          <div className="space-y-3">
            <StatusCard
              compact
              label="Acid Level"
              value={status?.acidLevel ?? "UNKNOWN"}
              level={status?.acidLevel === "FULL" ? "ERROR" : "OK"}
              icon={<Droplets className="w-4 h-4" />}
            />

            <StatusCard
              compact
              label="Neutralizer"
              value={status?.neutralizerLevel ?? "UNKNOWN"}
              level={status?.neutralizerLevel === "FULL" ? "ERROR" : "OK"}
              icon={<Beaker className="w-4 h-4" />}
            />

            <StatusCard
              compact
              label="Waste Tank"
              value={status?.wasteLevel ?? "UNKNOWN"}
              level={status?.wasteLevel === "FULL" ? "ERROR" : "OK"}
              icon={<Trash2 className="w-4 h-4" />}
            />
          </div>
        </div>
    );
}