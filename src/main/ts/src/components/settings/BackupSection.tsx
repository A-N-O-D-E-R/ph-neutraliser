import { Settings } from "../../types"
import React from "react"
import { Card, CardContent } from "../ui/card"
import { SectionHeader } from "./Section"
import { Download, HardDrive, Upload } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"
import { downloadFile } from "../../utils/tools"

export default function BackupSection({ settings, update }: { settings: Settings , update: (partial: Partial<Settings>) => void}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [restoreStatus, setRestoreStatus] = React.useState<"idle" | "success" | "error">("idle")

  function handleBackup() {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
    }
    downloadFile(JSON.stringify(payload, null, 2),`ph-neutraliser-backup-${new Date().toISOString().slice(0, 10)}.json`,"application/json" )
  }


  function handleRestore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        const restored = parsed.settings ?? parsed
        update(restored);
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
