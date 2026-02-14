import * as React from "react"
import {
  LayoutDashboard,
  Cpu,
  Settings,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "./ui/command"
import { useNavigation, type Page } from "../hooks/use-navigation"

type CommandEntry = {
  label: string
  page: Page
  icon: React.ReactNode
  shortcut?: string
}

const commands: CommandEntry[] = [
  { label: "Dashboard", page: "dashboard", icon: <LayoutDashboard />, shortcut: "D" },
  { label: "Hardware", page: "hardware", icon: <Cpu />, shortcut: "H" },
  { label: "Settings", page: "settings", icon: <Settings />, shortcut: "S" },
]

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const { setPage } = useNavigation()

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ( event.key === "k" &&
        (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const navigate = React.useCallback(
    (page: Page) => {
      setPage(page)
      setOpen(false)
    },
    [setPage]
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen} showCloseButton={false}>
      <CommandInput placeholder="Search pages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {commands.map((cmd) => (
            <CommandItem
              key={cmd.page}
              onSelect={() => navigate(cmd.page)}
            >
              {cmd.icon}
              <span>{cmd.label}</span>
              {cmd.shortcut && (
                <CommandShortcut>{cmd.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
