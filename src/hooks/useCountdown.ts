import { useEffect, useState } from 'react'
// Все части вычисляются из одного момента времени; после даты значения равны нулю.
export function getCountdown(date: string, now = Date.now()) {
  const total = Math.max(0, Math.floor((new Date(date).getTime() - now) / 1000))
  return [
    Math.floor(total / 86400),
    Math.floor(total / 3600) % 24,
    Math.floor(total / 60) % 60,
    total % 60,
  ]
}
export function useCountdown(date: string) {
  const [remaining, setRemaining] = useState(() => getCountdown(date))
  useEffect(() => {
    const timer = window.setInterval(
      () => setRemaining(getCountdown(date)),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [date])
  return remaining
}
