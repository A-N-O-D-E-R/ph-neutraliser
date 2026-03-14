import { Settings } from "../../types"
import { Card, CardContent } from "../ui/card"
import { Field, SectionHeader, ToggleGroup } from "./Section"
import { Network } from "lucide-react"
import { Input } from "../ui/input"

export default function NetworkSection({
  settings,
  update,
}: {
  settings: Settings
  update: (partial: Partial<Settings>) => void
}) {
  return (
    <Card>
      <SectionHeader
        icon={<Network className="h-5 w-5" />}
        title="Network"
        description="IP configuration for this device"
      />
      <CardContent className="pt-6 space-y-5">
        <ToggleGroup
          value={settings.networkMode}
          onChange={v => update({ networkMode: v })}
          options={[
            { value: "dhcp", label: "DHCP" },
            { value: "static", label: "Static IP" },
          ]}
        />

        <Field label="Hostname">
          <Input
            value={settings.hostname}
            onChange={e => update({ hostname: e.target.value })}
            placeholder="ph-neutraliser-01"
          />
        </Field>

        {settings.networkMode === "static" && (
          <div className="space-y-3 rounded-lg border border-border p-4">
            <Field label="IP Address">
              <Input
                value={settings.ipAddress}
                onChange={e => update({ ipAddress: e.target.value })}
                placeholder="192.168.1.100"
              />
            </Field>
            <Field label="Subnet Mask">
              <Input
                value={settings.subnetMask}
                onChange={e => update({ subnetMask: e.target.value })}
                placeholder="255.255.255.0"
              />
            </Field>
            <Field label="Default Gateway">
              <Input
                value={settings.gateway}
                onChange={e => update({ gateway: e.target.value })}
                placeholder="192.168.1.1"
              />
            </Field>
            <Field label="Primary DNS">
              <Input
                value={settings.dns1}
                onChange={e => update({ dns1: e.target.value })}
                placeholder="8.8.8.8"
              />
            </Field>
            <Field label="Secondary DNS">
              <Input
                value={settings.dns2}
                onChange={e => update({ dns2: e.target.value })}
                placeholder="8.8.4.4"
              />
            </Field>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
