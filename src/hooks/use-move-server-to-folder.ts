import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateServerFolder } from "@/lib/api/user/folders"
import { invalidateServerFoldersIfNeeded } from "@/lib/servers/folder-queries"
import { useServersStore } from "@/stores/servers-store"

type MoveServerToFolderInput = {
  serverId: number
  folderName: string | null
}

export function useMoveServerToFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ serverId, folderName }: MoveServerToFolderInput) =>
      updateServerFolder(serverId, { folderName }),
    onMutate: ({ serverId, folderName }) => {
      const previousFolderName =
        useServersStore.getState().servers[serverId]?.folderName ?? null

      useServersStore.getState().setServerFolderName(serverId, folderName)

      return { serverId, previousFolderName }
    },
    onError: (_error, _variables, context) => {
      if (context) {
        useServersStore
          .getState()
          .setServerFolderName(context.serverId, context.previousFolderName)
      }
    },
    onSuccess: (assignment) => {
      useServersStore
        .getState()
        .setServerFolderName(assignment.serverId, assignment.folderName)
      invalidateServerFoldersIfNeeded(
        queryClient,
        assignment.folderName
      )
    },
  })
}
