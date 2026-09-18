import { MoveUpRight } from 'lucide-react'
import { drinks } from '../config/wedding'
import { useRsvp } from '../hooks/useRsvp'
export function Rsvp() {
  const {
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
  } = useRsvp()
  return (
    <section className="rsvp section" id="rsvp">
      <div className="rsvp-copy">
        <div className="eyebrow">ПАРА СЛОВ О ВАС</div>
        <h2>
          Что будем
          <br />
          <em>
            поднимать
            <br /> за любовь?
          </em>
        </h2>
        <p>
          Поделитесь предпочтениями,
          <br />
          чтобы мы могли позаботиться
          <br />о каждом из вас.
        </p>
        <span className="rsvp-star" aria-hidden="true">
          ✳
        </span>
      </div>
      <form onSubmit={submit} aria-busy={isSubmitting}>
        <label className="field-label" htmlFor="guest">
          Ваше имя и фамилия
        </label>
        <input
          id="guest"
          disabled={isSubmitting}
          autoComplete="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setStatus('')
          }}
          placeholder="Как вас зовут?"
          required
          maxLength={120}
        />
        <fieldset disabled={isSubmitting}>
          <legend>Какие напитки вы предпочитаете?</legend>
          <p className="form-hint">Можно выбрать несколько вариантов</p>
          <div className="drink-options">
            {drinks.map((drink) => (
              <label
                key={drink}
                className={selected.includes(drink) ? 'selected' : ''}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(drink)}
                  onChange={() => toggle(drink)}
                />
                <span>{drink}</span>
                <span className="check" aria-hidden="true">
                  {selected.includes(drink) ? '✓' : '+'}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {selected.includes('Свой вариант') && (
          <label className="other-label">
            Ваш вариант
            <input
              disabled={isSubmitting}
              value={other}
              onChange={(e) => {
                setOther(e.target.value)
                setStatus('')
              }}
              required
              placeholder="Любимый напиток"
              maxLength={200}
            />
          </label>
        )}
        <button className="subButton" type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Отправляем…'
            : isConnected
              ? 'Отправить ответ'
              : 'Сохранить ответ'}{' '}
          <span aria-hidden="true"><MoveUpRight size={12} /></span>
        </button>
        <p className="form-hint storage-note">
          {isConnected
            ? 'Нажимая «Отправить ответ», вы передаёте своё имя и предпочтения Ивану и Ангелине для подготовки свадьбы.'
            : 'Пока ответ сохраняется только в вашем браузере. Отправка организаторам ещё не подключена.'}
        </p>
        <p className="form-status" role="status">
          {status}
        </p>
      </form>
    </section>
  )
}
