import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dashboard } from './components/Dashboard'
import Layout from './components/layout/AppLayout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <Layout>
      <Dashboard />
    </Layout>
    </QueryClientProvider>
  )
}
