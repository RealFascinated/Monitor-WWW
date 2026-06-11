import { useCallback, useEffect, useState } from "react"

const SIDEBAR_DETAILED_MODE_STORAGE_KEY = "sidebar-detailed-mode"

export function useSidebarDetailedMode() {
  const [detailed, setDetailed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_DETAILED_MODE_STORAGE_KEY)
    if (stored === "true") {
      setDetailed(true)
    }
  }, [])

  const setDetailedPersisted = useCallback((value: boolean) => {
    setDetailed(value)
    localStorage.setItem(SIDEBAR_DETAILED_MODE_STORAGE_KEY, String(value))
  }, [])

  const toggleDetailed = useCallback(() => {
    setDetailed((current) => {
      const next = !current
      localStorage.setItem(SIDEBAR_DETAILED_MODE_STORAGE_KEY, String(next))
      return next
    })
  }, [])

  return {
    detailed,
    setDetailed: setDetailedPersisted,
    toggleDetailed,
  } as const
}
