import { Shield } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { Field, PasswordInput, SectionHeader, ToggleGroup } from "./Section"
import { Settings } from "../../types"
import { Input } from "../ui/input"

export default function SecuritySection({
  settings,
  update,
}: {
  settings: Settings
  update: (partial: Partial<Settings>) => void
}) {
  return (
    <Card>
      <SectionHeader
        icon={<Shield className="h-5 w-5" />}
        title="Security"
        description="Configure authentication method"
      />
      <CardContent className="pt-6 space-y-5">
        <ToggleGroup
          value={settings.authMethod}
          onChange={v => update({ authMethod: v })}
          options={[
            { value: "credentials", label: "Username / Password" },
            { value: "oauth2", label: "OAuth2 / SSO" },
          ]}
        />

        {settings.authMethod === "oauth2" && (
          <div className="space-y-3 rounded-lg border border-border p-4">
            <Field label="Authorization URL">
              <Input
                value={settings.oauth2Url}
                onChange={e => update({ oauth2Url: e.target.value })}
                placeholder="https://auth.example.com/oauth2/authorize"
              />
            </Field>
            <Field label="Client ID">
              <Input
                value={settings.oauth2ClientId}
                onChange={e => update({ oauth2ClientId: e.target.value })}
                placeholder="your-client-id"
              />
            </Field>
            <Field label="Client Secret">
              <PasswordInput
                value={settings.oauth2ClientSecret}
                onChange={v => update({ oauth2ClientSecret: v })}
                placeholder="your-client-secret"
              />
            </Field>
          </div>
        )}

        {settings.authMethod === "credentials" && (
          <div className="space-y-3 rounded-lg border border-border p-4">
            <Field label="Username">
              <Input
                value={settings.credUsername}
                onChange={e => update({ credUsername: e.target.value })}
                placeholder="admin"
              />
            </Field>
            <Field label="Password">
              <PasswordInput
                value={settings.credPassword}
                onChange={v => update({ credPassword: v })}
                placeholder="••••••••"
              />
            </Field>
          </div>
        )}
      </CardContent>
    </Card>
  )
}