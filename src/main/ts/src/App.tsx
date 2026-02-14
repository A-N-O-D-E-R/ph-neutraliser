import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dashboard } from './components/Dashboard'
import Layout from './components/layout/AppLayout'
import { NavigationProvider, useNavigation } from './hooks/use-navigation'

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
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold">Hardware</h1>
          <p className="text-muted-foreground mt-2">Hardware configuration coming soon.</p>
        </div>
      )
    case "settings":
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">Settings page coming soon.</p>
        </div>
      )
    default:
      return <Dashboard />
  }
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationProvider>
        <Layout>
          <PageContent />
        </Layout>
      </NavigationProvider>
    </QueryClientProvider>
  )
}
