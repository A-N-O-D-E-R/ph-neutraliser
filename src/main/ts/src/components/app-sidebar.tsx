import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "./ui/sidebar"

import {
  LayoutDashboard,
  Cpu,
  Settings,
  Users,
  LogOut,
} from "lucide-react"

import { useNavigation, type Page } from "../hooks/use-navigation"
import { useAuth } from "../hooks/use-auth"
import { FlaskConical } from "lucide-react"

const navItems: { label: string; page: Page; icon: React.ReactNode }[] = [
  { label: "Dashboard", page: "dashboard", icon: <LayoutDashboard /> },
  { label: "Hardware", page: "hardware", icon: <Cpu /> },
]

export function AppSidebar() {
  const { page, setPage } = useNavigation()
  const { authMethod, user, logout } = useAuth()

  const systemItems: { label: string; page: Page; icon: React.ReactNode }[] = [
    ...(authMethod === "credentials" ? [{ label: "Users", page: "userManagement" as Page, icon: <Users /> }] : []),
    { label: "Settings", page: "settings", icon: <Settings /> },
  ]

  return (
    <Sidebar variant="inset">

      {/* HEADER */}
      <SidebarHeader className="px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">pH Neutralizer</p>
            <p className="text-xs text-muted-foreground mt-0.5">Control Panel</p>
          </div>
        </div>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>

        {/* MAIN NAVIGATION */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.page}>
                  <SidebarMenuButton
                    isActive={page === item.page}
                    tooltip={item.label}
                    onClick={() => setPage(item.page)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SYSTEM GROUP */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.page}>
                  <SidebarMenuButton
                    isActive={page === item.page}
                    tooltip={item.label}
                    onClick={() => setPage(item.page)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="px-6 py-4 space-y-2">
        {user && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground truncate">{user.username}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">v1.0.0</p>
      </SidebarFooter>

    </Sidebar>
  )
}
