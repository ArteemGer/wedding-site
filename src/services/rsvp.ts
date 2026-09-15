export interface RsvpAnswer {
  name: string
  drinks: string[]
  other: string
}

export interface RsvpSubmission extends RsvpAnswer {
  submissionId: string
}

const REQUEST_KEY = 'wedding-rsvp-request'
let lastRequest: { fingerprint: string; submissionId: string } | undefined

/** Reuse the receipt ID when retrying an unchanged answer, even after reload. */
export function prepareSubmission(answer: RsvpAnswer): RsvpSubmission {
  const normalized = { ...answer, drinks: [...answer.drinks].sort() }
  const fingerprint = JSON.stringify(normalized)
  if (!lastRequest) {
    try {
      const stored = JSON.parse(localStorage.getItem(REQUEST_KEY) || 'null')
      if (
        typeof stored?.fingerprint === 'string' &&
        typeof stored?.submissionId === 'string' &&
        /^[a-f0-9-]{36}$/.test(stored.submissionId)
      ) {
        lastRequest = stored
      }
    } catch {
      /* In-memory retries still work if storage is unavailable. */
    }
  }
  if (lastRequest?.fingerprint !== fingerprint) {
    lastRequest = { fingerprint, submissionId: crypto.randomUUID() }
  }
  try {
    localStorage.setItem(REQUEST_KEY, JSON.stringify(lastRequest))
  } catch {
    /* Storage failure must not prevent sending the answer. */
  }
  return { ...normalized, submissionId: lastRequest.submissionId }
}

/** Only a readable, matching server receipt confirms a successful write. */
export async function sendRsvp(
  endpoint: string,
  submission: RsvpSubmission,
  timeoutMs = 30_000,
) {
  if (
    !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(
      endpoint,
    )
  ) {
    throw new Error(
      'Некорректный адрес приёма ответов. Сообщите организаторам.',
    )
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      // A safelisted content type avoids an unsupported OPTIONS preflight.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(submission),
      credentials: 'omit',
      redirect: 'follow',
      signal: controller.signal,
    })
    if (!response.ok) throw new Error('HTTP error')
    const receipt: unknown = await response.json()
    if (
      !receipt ||
      typeof receipt !== 'object' ||
      !('ok' in receipt) ||
      receipt.ok !== true ||
      !('submissionId' in receipt) ||
      receipt.submissionId !== submission.submissionId
    ) {
      throw new Error('Missing receipt')
    }
  } catch {
    // A timeout/CORS failure can happen after the row has already been written.
    // Retrying uses the same ID, so the server does not append a duplicate.
    throw new Error(
      'Не удалось подтвердить отправку. Проверьте интернет и попробуйте ещё раз — повторный ответ не задублируется.',
    )
  } finally {
    clearTimeout(timeout)
  }
}
