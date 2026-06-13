import { useServersStore } from "@/stores/servers-store"

export function setFolderNameOnServers(
  folderName: string,
  nextFolderName: string | null
) {
  useServersStore
    .getState()
    .setServersFolderName(folderName, nextFolderName)
}
