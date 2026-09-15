import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { rsvpConfig } from '../config/rsvp'
import { prepareSubmission, sendRsvp } from '../services/rsvp'
import { readSaved } from '../utils/rsvpStorage'

export function useRsvp() {
  const [saved] = useState(readSaved)
  const [name, setName] = useState(saved.name)
  const [selected, setSelected] = useState<string[]>(saved.drinks)
  const [other, setOther] = useState(saved.other)
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const sending = useRef(false)
  const isConnected = Boolean(rsvpConfig.endpoint.trim())

  function toggle(drink: string) {
    setStatus('')
    setSelected((current) =>
      current.includes(drink)
        ? current.filter((d) => d !== drink)
        : drink === 'Не буду пить'
          ? [drink]
          : [...current.filter((d) => d !== 'Не буду пить'), drink],
    )
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (sending.current) return
    if (!name.trim()) {
      setStatus('Пожалуйста, укажите ваше имя.')
      return
    }
    if (!selected.length) {
      setStatus('Выберите хотя бы один вариант напитка.')
      return
    }
    if (selected.includes('Свой вариант') && !other.trim()) {
      setStatus('Напишите ваш вариант напитка.')
      return
    }
    const answer = {
      name: name.trim(),
      drinks: selected,
      other: selected.includes('Свой вариант') ? other.trim() : '',
    }
    let draftSaved = false
    try {
      localStorage.setItem('wedding-rsvp', JSON.stringify(answer))
      draftSaved = true
    } catch {
      /* An unavailable local draft must not block remote delivery. */
    }

    if (!isConnected) {
      setStatus(
        draftSaved
          ? 'Ответ сохранён на этом устройстве. Организаторам он пока не отправлен.'
          : 'Не удалось сохранить ответ: хранилище браузера недоступно.',
      )
      return
    }

    sending.current = true
    setIsSubmitting(true)
    setStatus('Отправляем ваш ответ…')
    try {
      await sendRsvp(
        rsvpConfig.endpoint.trim(),
        prepareSubmission(answer),
        rsvpConfig.timeoutMs,
      )
      setStatus('Спасибо! Ваш ответ получен. Будем рады видеть вас на свадьбе!')
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Не удалось отправить ответ. Попробуйте ещё раз.',
      )
    } finally {
      sending.current = false
      setIsSubmitting(false)
    }
  }

  return {
    name,
    setName,
    selected,
    other,
    setOther,
    status,
    setStatus,
    toggle,
    submit,
    isSubmitting,
    isConnected,
  }
}
