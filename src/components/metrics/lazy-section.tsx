import { useEffect, useRef, useState } from "react"

type LazySectionProps = {
  title: string
  description?: string
  children: React.ReactNode
}

function LazySection({ title, description, children }: LazySectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = sectionRef.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold dark:text-white">{title}</h2>
        {description ? (
          <p className="text-sm text-neutral-500">{description}</p>
        ) : null}
      </div>
      {visible ? children : <div className="min-h-32" />}
    </section>
  )
}

export { LazySection }
