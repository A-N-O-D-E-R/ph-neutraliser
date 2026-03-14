import { Settings } from "@/types"
import { Card, CardContent } from "../ui/card"
import { Activity } from "lucide-react"
import { Field, PasswordInput, SectionHeader } from "./Section"
import { Input } from "../ui/input"

export default function MonitoringSection({
  settings,
  update,
}: {
  settings: Settings
  update: (partial: Partial<Settings>) => void
}) {
  return (
    <Card>
      <SectionHeader
        icon={<Activity className="h-5 w-5" />}
        title="Monitoring"
        description="Zabbix server integration for metrics and alerting"
      />
      <CardContent className="pt-6 space-y-3">
        <Field label="Zabbix Server URL">
          <Input
            value={settings.zabbixUrl}
            onChange={e => update({ zabbixUrl: e.target.value })}
            placeholder="https://zabbix.example.com"
          />
        </Field>
        <Field label="API Token">
          <PasswordInput
            value={settings.zabbixApiToken}
            onChange={v => update({ zabbixApiToken: v })}
            placeholder="your-api-token"
          />
        </Field>
        <Field label="Host Name">
          <Input
            value={settings.zabbixHost}
            onChange={e => update({ zabbixHost: e.target.value })}
            placeholder="ph-neutraliser-01"
          />
        </Field>
      </CardContent>
    </Card>
  )
}
