import * as React from "react"
import { Moon, Sun, Monitor, Shield, MessageSquare, Activity, Save, Eye, EyeOff, Network, Clock, Building2, HardDrive, Download, Upload, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { cn } from "../../lib/utils"
import { useTheme, type Theme } from "../../hooks/use-theme"
import { neutralizerApi } from "../../api/client"
import type { MeasureEvent, NeutralizerEvent } from "../../types"

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

interface Settings {
  systemName: string
  location: string
  networkMode: "dhcp" | "static"
  ipAddress: string
  subnetMask: string
  gateway: string
  dns1: string
  dns2: string
  hostname: string
  timezone: string
  ntpServer: string
  authMethod: "oauth2" | "credentials"
  oauth2Url: string
  oauth2ClientId: string
  oauth2ClientSecret: string
  credUsername: string
  credPassword: string
  teamsEnabled: boolean
  teamsWebhook: string
  slackEnabled: boolean
  slackWebhook: string
  telegramEnabled: boolean
  telegramBotToken: string
  telegramChatId: string
  zabbixUrl: string
  zabbixApiToken: string
  zabbixHost: string
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem("app-settings")
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) }
  } catch {}
  return defaultSettings
}

const defaultSettings: Settings = {
  systemName: "",
  location: "",
  networkMode: "dhcp",
  ipAddress: "",
  subnetMask: "255.255.255.0",
  gateway: "",
  dns1: "",
  dns2: "",
  hostname: "",
  timezone: "UTC",
  ntpServer: "pool.ntp.org",
  authMethod: "credentials",
  oauth2Url: "",
  oauth2ClientId: "",
  oauth2ClientSecret: "",
  credUsername: "",
  credPassword: "",
  teamsEnabled: false,
  teamsWebhook: "",
  slackEnabled: false,
  slackWebhook: "",
  telegramEnabled: false,
  telegramBotToken: "",
  telegramChatId: "",
  zabbixUrl: "",
  zabbixApiToken: "",
  zabbixHost: "",
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <CardHeader className="border-b pb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = React.useState(false)
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; icon?: React.ReactNode }[]
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            value === opt.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground hover:bg-accent"
          )}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function MessagingCard({
  title,
  icon,
  enabled,
  onToggle,
  children,
}: {
  title: string
  icon: React.ReactNode
  enabled: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className={cn("rounded-lg border p-4 space-y-4 transition-colors", enabled ? "border-primary/30 bg-primary/5" : "border-border")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors",
            enabled ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
              enabled ? "translate-x-4" : "translate-x-0"
            )}
          />
        </button>
      </div>
      {enabled && <div className="space-y-3">{children}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section components
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// IANA timezone list (abbreviated)
// ---------------------------------------------------------------------------

const TIMEZONES = [
  "UTC",
  "Europe/Paris", "Europe/London", "Europe/Berlin", "Europe/Madrid", "Europe/Rome",
  "Europe/Amsterdam", "Europe/Brussels", "Europe/Zurich", "Europe/Warsaw", "Europe/Prague",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Sao_Paulo", "America/Mexico_City", "America/Toronto", "America/Vancouver",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore",
  "Asia/Seoul", "Asia/Taipei", "Asia/Bangkok",
  "Australia/Sydney", "Australia/Melbourne", "Pacific/Auckland",
  "Africa/Cairo", "Africa/Johannesburg", "Africa/Lagos",
]

function SystemIdentitySection({
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

function NetworkSection({
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

function TimeSection({
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

function AppearanceSection({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  return (
    <Card>
      <SectionHeader
        icon={<Sun className="h-5 w-5" />}
        title="Appearance"
        description="Choose how the interface looks"
      />
      <CardContent className="pt-6">
        <ToggleGroup
          value={theme}
          onChange={setTheme}
          options={[
            { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
            { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
            { value: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
          ]}
        />
      </CardContent>
    </Card>
  )
}

function SecuritySection({
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

function TeamsIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.19 8.77a3.27 3.27 0 1 0-3.27-3.27 3.27 3.27 0 0 0 3.27 3.27zm0-4.91a1.64 1.64 0 1 1-1.64 1.64 1.64 1.64 0 0 1 1.64-1.64zM12 10.41a3.27 3.27 0 1 0-3.27-3.27A3.27 3.27 0 0 0 12 10.41zm0-4.91a1.64 1.64 0 1 1-1.64 1.64A1.64 1.64 0 0 1 12 5.5zm7.19 5.18h-3a4.91 4.91 0 0 1 1.64 3.68v4.09H21a.82.82 0 0 0 .82-.82v-3.27a3.68 3.68 0 0 0-2.63-3.68zm-14.38 0a3.68 3.68 0 0 0-2.62 3.68v3.27a.82.82 0 0 0 .81.82h4.1v-4.09a4.91 4.91 0 0 1 1.63-3.68zm7.19 0a3.27 3.27 0 0 0-3.27 3.27v4.91a.82.82 0 0 0 .82.82h4.9a.82.82 0 0 0 .82-.82v-4.91A3.27 3.27 0 0 0 12 10.68z" />
    </svg>
  )
}

function SlackIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.04 15.44a2.52 2.52 0 0 1-2.52 2.52A2.52 2.52 0 0 1 0 15.44a2.52 2.52 0 0 1 2.52-2.52h2.52v2.52zm1.26 0a2.52 2.52 0 0 1 2.52-2.52 2.52 2.52 0 0 1 2.52 2.52v6.3A2.52 2.52 0 0 1 8.82 24a2.52 2.52 0 0 1-2.52-2.52v-6.04zM8.82 5.04a2.52 2.52 0 0 1-2.52-2.52A2.52 2.52 0 0 1 8.82 0a2.52 2.52 0 0 1 2.52 2.52v2.52H8.82zm0 1.26a2.52 2.52 0 0 1 2.52 2.52 2.52 2.52 0 0 1-2.52 2.52H2.52A2.52 2.52 0 0 1 0 8.82a2.52 2.52 0 0 1 2.52-2.52h6.3zm10.4 2.52a2.52 2.52 0 0 1 2.52-2.52A2.52 2.52 0 0 1 24 8.82a2.52 2.52 0 0 1-2.52 2.52h-2.52V8.82zm-1.26 0a2.52 2.52 0 0 1-2.52 2.52 2.52 2.52 0 0 1-2.52-2.52V2.52A2.52 2.52 0 0 1 15.44 0a2.52 2.52 0 0 1 2.52 2.52v6.3zm-2.52 10.4a2.52 2.52 0 0 1 2.52 2.52A2.52 2.52 0 0 1 15.44 24a2.52 2.52 0 0 1-2.52-2.52v-2.52h2.52zm0-1.26a2.52 2.52 0 0 1-2.52-2.52 2.52 2.52 0 0 1 2.52-2.52h6.04A2.52 2.52 0 0 1 24 15.44a2.52 2.52 0 0 1-2.52 2.52h-6.04z" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.19 13.467l-2.95-.924c-.64-.203-.658-.64.136-.952l11.5-4.432c.537-.194 1.006.131.837.962z" />
    </svg>
  )
}

function MessagingSection({
  settings,
  update,
}: {
  settings: Settings
  update: (partial: Partial<Settings>) => void
}) {
  return (
    <Card>
      <SectionHeader
        icon={<MessageSquare className="h-5 w-5" />}
        title="Messaging"
        description="Configure notification channels for alerts and events"
      />
      <CardContent className="pt-6 space-y-3">
        <MessagingCard
          title="Microsoft Teams"
          icon={<TeamsIcon />}
          enabled={settings.teamsEnabled}
          onToggle={() => update({ teamsEnabled: !settings.teamsEnabled })}
        >
          <Field label="Incoming Webhook URL">
            <Input
              value={settings.teamsWebhook}
              onChange={e => update({ teamsWebhook: e.target.value })}
              placeholder="https://outlook.office.com/webhook/..."
            />
          </Field>
        </MessagingCard>

        <MessagingCard
          title="Slack"
          icon={<SlackIcon />}
          enabled={settings.slackEnabled}
          onToggle={() => update({ slackEnabled: !settings.slackEnabled })}
        >
          <Field label="Incoming Webhook URL">
            <Input
              value={settings.slackWebhook}
              onChange={e => update({ slackWebhook: e.target.value })}
              placeholder="https://hooks.slack.com/services/..."
            />
          </Field>
        </MessagingCard>

        <MessagingCard
          title="Telegram"
          icon={<TelegramIcon />}
          enabled={settings.telegramEnabled}
          onToggle={() => update({ telegramEnabled: !settings.telegramEnabled })}
        >
          <Field label="Bot Token">
            <PasswordInput
              value={settings.telegramBotToken}
              onChange={v => update({ telegramBotToken: v })}
              placeholder="123456:ABCdef..."
            />
          </Field>
          <Field label="Chat ID">
            <Input
              value={settings.telegramChatId}
              onChange={e => update({ telegramChatId: e.target.value })}
              placeholder="-100123456789"
            />
          </Field>
        </MessagingCard>
      </CardContent>
    </Card>
  )
}

function MonitoringSection({
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

// ---------------------------------------------------------------------------
// Export Logs Section
// ---------------------------------------------------------------------------

type LogType = "measures" | "ph" | "status"
type ExportFormat = "csv" | "json"

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const lines = [headers.join(","), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","))]
  return lines.join("\n")
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function ExportLogsSection() {
  const today = new Date().toISOString().slice(0, 10)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)

  const [startDate, setStartDate] = React.useState(thirtyDaysAgo)
  const [endDate, setEndDate] = React.useState(today)
  const [logType, setLogType] = React.useState<LogType>("measures")
  const [format, setFormat] = React.useState<ExportFormat>("csv")
  const [status, setStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle")

  async function handleExport() {
    setStatus("loading")
    try {
      let rows: Record<string, unknown>[]
      const start = startDate || undefined
      const end = endDate || undefined

      if (logType === "measures") {
        const events: MeasureEvent[] = await neutralizerApi.getMeasureEvents(start, end)
        rows = events as unknown as Record<string, unknown>[]
      } else if (logType === "ph") {
        const events: MeasureEvent[] = await neutralizerApi.getPhMeasureEvents(start, end)
        rows = events as unknown as Record<string, unknown>[]
      } else {
        const events: NeutralizerEvent[] = await neutralizerApi.getStatusEvents(start, end)
        rows = events as unknown as Record<string, unknown>[]
      }

      const slug = `${logType}-${startDate}_${endDate}`
      if (format === "json") {
        downloadFile(JSON.stringify(rows, null, 2), `logs-${slug}.json`, "application/json")
      } else {
        downloadFile(toCSV(rows), `logs-${slug}.csv`, "text/csv")
      }
      setStatus("done")
    } catch {
      setStatus("error")
    } finally {
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <Card>
      <SectionHeader
        icon={<FileText className="h-5 w-5" />}
        title="Export Logs"
        description="Download historical sensor and status event data"
      />
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="From">
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} max={endDate || today} />
          </Field>
          <Field label="To">
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} max={today} />
          </Field>
        </div>

        <Field label="Data type">
          <ToggleGroup
            value={logType}
            onChange={setLogType}
            options={[
              { value: "measures", label: "All measures" },
              { value: "ph", label: "pH only" },
              { value: "status", label: "Status events" },
            ]}
          />
        </Field>

        <Field label="Format">
          <ToggleGroup
            value={format}
            onChange={setFormat}
            options={[
              { value: "csv", label: "CSV" },
              { value: "json", label: "JSON" },
            ]}
          />
        </Field>

        <Button
          onClick={handleExport}
          disabled={status === "loading"}
          className={cn(
            "gap-2",
            status === "done" && "bg-green-600 hover:bg-green-600",
            status === "error" && "bg-red-600 hover:bg-red-600",
          )}
        >
          <Download className="h-4 w-4" />
          {status === "loading" ? "Fetching…" : status === "done" ? "Downloaded!" : status === "error" ? "Export failed" : "Export logs"}
        </Button>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Backup Section
// ---------------------------------------------------------------------------

function BackupSection({ settings }: { settings: Settings }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [restoreStatus, setRestoreStatus] = React.useState<"idle" | "success" | "error">("idle")

  function handleBackup() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ph-neutraliser-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleRestore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        const restored = parsed.settings ?? parsed
        localStorage.setItem("app-settings", JSON.stringify({ ...defaultSettings, ...restored }))
        setRestoreStatus("success")
        setTimeout(() => { setRestoreStatus("idle"); window.location.reload() }, 1500)
      } catch {
        setRestoreStatus("error")
        setTimeout(() => setRestoreStatus("idle"), 3000)
      }
    }
    reader.readAsText(file)
    // reset input so the same file can be re-selected
    e.target.value = ""
  }

  return (
    <Card>
      <SectionHeader
        icon={<HardDrive className="h-5 w-5" />}
        title="Backup & Restore"
        description="Export or import all settings as a JSON file"
      />
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={handleBackup}>
            <Download className="h-4 w-4" />
            Download backup
          </Button>
          <Button
            variant="outline"
            className={cn(
              "flex-1 gap-2",
              restoreStatus === "success" && "border-green-500 text-green-600",
              restoreStatus === "error" && "border-red-500 text-red-600",
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {restoreStatus === "success"
              ? "Restored — reloading…"
              : restoreStatus === "error"
              ? "Invalid backup file"
              : "Restore from backup"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleRestore}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          The backup contains all settings (network, security, integrations, etc.) but no sensor data or historical readings.
          Restoring will reload the page.
        </p>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main Settings Page
// ---------------------------------------------------------------------------

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = React.useState<Settings>(loadSettings)
  const [saved, setSaved] = React.useState(false)

  function update(partial: Partial<Settings>) {
    setSettings(s => ({ ...s, ...partial }))
    setSaved(false)
  }

  function save() {
    localStorage.setItem("app-settings", JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 p-6 md:p-8 lg:p-10 max-w-3xl">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage application preferences and integrations</p>
        </div>
        <Button onClick={save} size="sm" className={cn(saved && "bg-green-600 hover:bg-green-600")}>
          <Save className="h-4 w-4 mr-1.5" />
          {saved ? "Saved!" : "Save changes"}
        </Button>
      </div>

      <SystemIdentitySection settings={settings} update={update} />
      <NetworkSection settings={settings} update={update} />
      <TimeSection settings={settings} update={update} />
      <AppearanceSection theme={theme} setTheme={setTheme} />
      <SecuritySection settings={settings} update={update} />
      <MessagingSection settings={settings} update={update} />
      <MonitoringSection settings={settings} update={update} />
      <ExportLogsSection />
      <BackupSection settings={settings} />
    </div>
  )
}
