import * as React from "react"

export type Page = "dashboard" | "hardware" | "settings"

type NavigationContextProps = {
  page: Page
  setPage: (page: Page) => void
}

const NavigationContext = React.createContext<NavigationContextProps | null>(null)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = React.useState<Page>("dashboard")

  return (
    <NavigationContext.Provider value={{ page, setPage }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = React.useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider.")
  }
  return context
}
