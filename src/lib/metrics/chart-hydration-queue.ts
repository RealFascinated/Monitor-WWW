const CHARTS_PER_FRAME = 4

type HydrationCallback = () => void

const queue: HydrationCallback[] = []
let flushScheduled = false

function scheduleFlush() {
  if (flushScheduled) {
    return
  }

  flushScheduled = true

  requestAnimationFrame(() => {
    flushScheduled = false

    let processed = 0
    while (queue.length > 0 && processed < CHARTS_PER_FRAME) {
      queue.shift()?.()
      processed++
    }

    if (queue.length > 0) {
      scheduleFlush()
    }
  })
}

function enqueueChartHydration(callback: HydrationCallback): () => void {
  queue.push(callback)
  scheduleFlush()

  return () => {
    const index = queue.indexOf(callback)
    if (index >= 0) {
      queue.splice(index, 1)
    }
  }
}

export { enqueueChartHydration }
