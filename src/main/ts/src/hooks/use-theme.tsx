import { create } from "zustand"
import { STORAGE_KEYS } from "../utils/consts"
import { loadFromStorage, saveToStorage } from "@/utils/storage-helper"

export type Theme = "light" | "dark" | "system"

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(theme: Theme): "light" | "dark" {
  const resolved = theme === "system" ? getSystemTheme() : theme
  document.documentElement.classList.toggle("dark", resolved === "dark")
  return resolved
}

const stored =  loadFromStorage(STORAGE_KEYS.THEME, localStorage, "system");

interface ThemeStore {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const useThemeStore = create<ThemeStore>((set, get) => {
  if (typeof window !== "undefined") {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (get().theme === "system") {
        set({ resolvedTheme: applyTheme("system") })
      }
    })
  }

  return {
    theme: stored,
    resolvedTheme: applyTheme(stored),
    setTheme: (theme: Theme) => {
      saveToStorage(STORAGE_KEYS.THEME, localStorage, theme)
      set({ theme, resolvedTheme: applyTheme(theme) })
    },
  }
})

export function useTheme() {
  return useThemeStore()
}
