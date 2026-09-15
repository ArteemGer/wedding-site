import { drinks } from '../config/wedding'
export function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem('wedding-rsvp') || 'null')
    if (
      saved &&
      typeof saved.name === 'string' &&
      Array.isArray(saved.drinks)
    ) {
      return {
        name: saved.name as string,
        drinks: saved.drinks.filter(
          (d: unknown): d is string =>
            typeof d === 'string' && drinks.includes(d),
        ),
        other: typeof saved.other === 'string' ? (saved.other as string) : '',
      }
    }
  } catch {
    /* Storage may be unavailable. */
  }
  return { name: '', drinks: [] as string[], other: '' }
}
