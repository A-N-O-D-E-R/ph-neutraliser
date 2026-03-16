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
import { useSaveSettings, useSettings } from "../../hooks/use-settings"
import { DEFAULT_SETTINGS } from "../../utils/consts"

export function SettingsPage() {
  const { theme, setTheme } = useTheme()

  const { data: settings } = useSettings()
  const saveSettingsMutation = useSaveSettings()

  const [localSettings, setLocalSettings] = React.useState<Settings | null>(null)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    if (settings) setLocalSettings(settings)
  }, [settings])

  function update(partial: Partial<Settings>) {
    setLocalSettings((s) => (s ? { ...s, ...partial } : s))
    setSaved(false)
  }

  function save() {
    if (!localSettings) return

    saveSettingsMutation.mutate(localSettings, {
      onSuccess: () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      },
    })
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

      <SystemIdentitySection settings={localSettings ?? DEFAULT_SETTINGS} update={update} />
      <NetworkSection settings={localSettings ?? DEFAULT_SETTINGS} update={update} />
      <TimeSection settings={localSettings ?? DEFAULT_SETTINGS} update={update} />
      <AppearanceSection theme={theme} setTheme={setTheme} />
      <SecuritySection settings={localSettings ?? DEFAULT_SETTINGS} update={update} />
      <MessagingSection settings={localSettings ?? DEFAULT_SETTINGS} update={update} />
      <MonitoringSection settings={localSettings ?? DEFAULT_SETTINGS} update={update} />
      <ExportLogsSection />
      <BackupSection settings={localSettings ?? DEFAULT_SETTINGS} update={update} />
    </div>
  )
}
