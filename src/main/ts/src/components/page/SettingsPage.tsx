import * as React from "react"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"
import { useTheme } from "../../hooks/use-theme"
import type { Settings } from "../../types"
import { Save } from "lucide-react"
import SystemIdentitySection from "../settings/SystemIdentitySection"
import NetworkSection from "../settings/NetworkSection"
import TimeSection from "../settings/TimeSection"
import SecuritySection from "../settings/SecuritySection"
import MessagingSection from "../settings/MessagingSection"
import MonitoringSection from "../settings/MonitoringSection"
import ExportLogsSection from "../settings/LogsSection"
import BackupSection from "../settings/BackupSection"
import AppearanceSection from "../settings/ApparenceSection"


function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem("app-settings") // TODO: let the back handle the settings
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
      <BackupSection settings={settings} update={update} />
    </div>
  )
}
