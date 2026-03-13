import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dashboard } from './components/Dashboard'
import { HardwarePage } from './components/HardwarePage'
import { SettingsPage } from './components/settings/SettingsPage'
import { UserManagementPage } from './components/UserManagementPage'
import Layout from './components/layout/AppLayout'
import { NavigationProvider, useNavigation } from './hooks/use-navigation'
import { ThemeProvider } from './hooks/use-theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000,
    },
  },
})

function PageContent() {
  const { page } = useNavigation()

  switch (page) {
    case "dashboard":
      return <Dashboard />
    case "hardware":
      return <HardwarePage />
    case "settings":
      return <SettingsPage />
    case "userManagement":
      return <UserManagementPage />
    default:
      return <Dashboard />
  }
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NavigationProvider>
          <Layout>
            <PageContent />
          </Layout>
        </NavigationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
