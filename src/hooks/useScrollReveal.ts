import { useEffect, useRef } from 'react'

/** Reveal sections once, keeping content visible without observer support. */
export function useScrollReveal() {
  const pageRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const page = pageRef.current
    if (!page || !('IntersectionObserver' in window)) return

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sections = Array.from(page.querySelectorAll<HTMLElement>('.section'))
    let observer: IntersectionObserver | undefined

    function reset() {
      observer?.disconnect()
      sections.forEach((section) => section.classList.remove('reveal-pending'))
    }

    function setup() {
      reset()
      if (preference.matches) return
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.remove('reveal-pending')
            entry.target.classList.add('revealed')
            observer?.unobserve(entry.target)
          })
        },
        { threshold: 0, rootMargin: '0px 0px -35px 0px' },
      )

      sections.forEach((section) => {
        // Do not hide restored scroll positions or sections already in view.
        if (
          section.getBoundingClientRect().top < window.innerHeight ||
          section.classList.contains('revealed')
        )
          return
        section.classList.add('reveal-pending')
        observer?.observe(section)
      })
    }

    setup()
    preference.addEventListener('change', setup)
    return () => {
      reset()
      preference.removeEventListener('change', setup)
    }
  }, [])

  return pageRef
}
