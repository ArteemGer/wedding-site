import { MoveUpRight } from 'lucide-react'

export function Header() {
  return (
    <header className="topbar">
      <a className="wordmark" href="#home">
        МЫ ЖЕНИМСЯ
      </a>
      <a className="rsvp-link" href="#rsvp">
        Анкета гостя{' '}
        <span aria-hidden="true">
          <MoveUpRight size={12} />
        </span>
      </a>
    </header>
  )
}
