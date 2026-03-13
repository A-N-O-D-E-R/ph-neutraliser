export function InfoRow({ label, value, icon }: { label: string; value?: string | number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <span className="text-sm font-medium tabular-nums">{value ?? "--"}</span>
    </div>
  )
}
