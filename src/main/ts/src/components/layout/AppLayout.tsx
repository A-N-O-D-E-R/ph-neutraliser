import { SidebarProvider, SidebarInset, SidebarTrigger } from "../ui/sidebar"
import { AppSidebar } from "../app-sidebar"
import { Separator } from "../ui/separator"
import { CommandPalette } from "../CommandPalette"
import { SearchIcon } from "lucide-react"
import { useNavigation } from "../../hooks/use-navigation"

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  hardware: "Hardware",
  settings: "Settings",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { page } = useNavigation()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-4" />
          <span className="text-sm font-medium text-muted-foreground">
            {pageTitles[page] ?? "pH Neutralizer"}
          </span>
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
            className="ml-auto flex h-8 w-64 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground shadow-xs hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <SearchIcon className="size-4" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="pointer-events-none inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
      <CommandPalette />
    </SidebarProvider>
  )
}
