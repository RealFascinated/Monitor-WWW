let wsConnected = false

export function setWsConnected(connected: boolean): void {
  wsConnected = connected
}

export function isWsConnected(): boolean {
  return wsConnected
}
