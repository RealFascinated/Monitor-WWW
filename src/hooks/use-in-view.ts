import { useEffect, useRef, useState } from "react"

const METRIC_CHART_LAZY_ROOT_MARGIN = "400px 0px"

type ObserverCallback = (isIntersecting: boolean) => void

const observerCallbacks = new Map<Element, ObserverCallback>()
let sharedObserver: IntersectionObserver | null = null
let sharedObserverRootMargin = ""

function getSharedObserver(rootMargin: string) {
  if (sharedObserver && sharedObserverRootMargin === rootMargin) {
    return sharedObserver
  }

  sharedObserver?.disconnect()
  observerCallbacks.clear()

  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        observerCallbacks.get(entry.target)?.(entry.isIntersecting)
      }
    },
    { rootMargin }
  )
  sharedObserverRootMargin = rootMargin

  return sharedObserver
}

function observeElement(
  element: Element,
  callback: ObserverCallback,
  rootMargin: string
) {
  const observer = getSharedObserver(rootMargin)
  observerCallbacks.set(element, callback)
  observer.observe(element)

  return () => {
    observerCallbacks.delete(element)
    observer.unobserve(element)
  }
}

type UseInViewOptions = {
  rootMargin?: string
  once?: boolean
}

function useInView({
  rootMargin = "0px",
  once = false,
}: UseInViewOptions = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    return observeElement(
      element,
      (intersecting) => {
        if (intersecting) {
          setIsInView(true)
          if (once) {
            observerCallbacks.delete(element)
            sharedObserver?.unobserve(element)
          }
          return
        }

        if (!once) {
          setIsInView(false)
        }
      },
      rootMargin
    )
  }, [rootMargin, once])

  return { ref, isInView }
}

export { METRIC_CHART_LAZY_ROOT_MARGIN, useInView }
