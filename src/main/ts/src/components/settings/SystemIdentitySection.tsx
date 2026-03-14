import { Settings } from "@/types"
import { Building2 } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Field, SectionHeader } from "./Section"
import { Input } from "../ui/input"

export default function SystemIdentitySection({
  settings,
  update,
}: {
  settings: Settings
  update: (partial: Partial<Settings>) => void
}) {
  return (
    <Card>
      <SectionHeader
        icon={<Building2 className="h-5 w-5" />}
        title="System Identity"
        description="Name and location of this device"
      />
      <CardContent className="pt-6 space-y-3">
        <Field label="System Name">
          <Input
            value={settings.systemName}
            onChange={e => update({ systemName: e.target.value })}
            placeholder="PH-Neutraliser-01"
          />
        </Field>
        <Field label="Location / Plant Name">
          <Input
            value={settings.location}
            onChange={e => update({ location: e.target.value })}
            placeholder="Plant A – Line 3"
          />
        </Field>
      </CardContent>
    </Card>
  )
}
