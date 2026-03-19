export function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  const lines = [headers.join(","), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","))]
  return lines.join("\n")
}

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}