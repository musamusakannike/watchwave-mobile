"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

export interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: () => Promise<void>
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    loadThemePreference()
  }, [])

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("darkMode")
      if (savedTheme !== null) {
        setDarkMode(JSON.parse(savedTheme))
      }
    } catch (error) {
      console.error("Error loading theme preference:", error)
    }
  }

  const toggleDarkMode = async () => {
    try {
      const newDarkMode = !darkMode
      setDarkMode(newDarkMode)
      await AsyncStorage.setItem("darkMode", JSON.stringify(newDarkMode))
    } catch (error) {
      console.error("Error saving theme preference:", error)
    }
  }

  return <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
