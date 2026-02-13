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
  FlaskConical,
  Settings,
} from "lucide-react"

export function AppSidebar() {
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
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Hardware">
                  <Cpu />
                  <span>Hardware</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SYSTEM GROUP */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="px-6 py-4">
        <p className="text-xs text-muted-foreground">v1.0.0</p>
      </SidebarFooter>

    </Sidebar>
  )
}
