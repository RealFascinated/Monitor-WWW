import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import type { AdminSettingResponse } from "@/lib/api/admin/settings"
import {
  mergeAdminSettingsCache,
  updateAdminSetting,
} from "@/lib/api/admin/settings"
import { adminSettingsQueryOptions } from "@/lib/api/admin/settings.queries"
import { ApiClientError } from "@/lib/auth/api"

type SettingUpdateDefinition = {
  key: string
}

export function useAdminSettingUpdate(definition: SettingUpdateDefinition) {
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (value: boolean | string | number) =>
      updateAdminSetting(definition.key, { value }),
    onSuccess: (updated) => {
      queryClient.setQueryData<AdminSettingResponse[]>(
        adminSettingsQueryOptions().queryKey,
        (current) => mergeAdminSettingsCache(current, updated)
      )
      setErrorMessage(null)
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof ApiClientError
          ? error.message
          : "Failed to update setting"
      )
    },
  })

  return { mutation, errorMessage }
}
