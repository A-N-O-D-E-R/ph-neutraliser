import { Settings } from "../../types"
import { Field, SectionHeader } from "./Section"
import { Card, CardContent } from "../ui/card"
import { Clock } from "lucide-react"
import { Input } from "../ui/input"
import { TIMEZONES } from "../../utils/consts"

export default function TimeSection({
  settings,
  update,
}: {
  settings: Settings
  update: (partial: Partial<Settings>) => void
}) {
  return (
    <Card>
      <SectionHeader
        icon={<Clock className="h-5 w-5" />}
        title="Time & Timezone"
        description="System clock and NTP configuration"
      />
      <CardContent className="pt-6 space-y-3">
        <Field label="Timezone">
          <select
            value={settings.timezone}
            onChange={e => update({ timezone: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {TIMEZONES.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </Field>
        <Field label="NTP Server">
          <Input
            value={settings.ntpServer}
            onChange={e => update({ ntpServer: e.target.value })}
            placeholder="pool.ntp.org"
          />
        </Field>
      </CardContent>
    </Card>
  )
}
