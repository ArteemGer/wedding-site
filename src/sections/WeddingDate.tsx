import { weddingDate } from '../utils/weddingDate'

const weekdays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']

export function WeddingDate() {
  return (
    <section className="date-section section" id="date">
      <div className="date-copy">
        <div className="eyebrow">ТОТ САМЫЙ ДЕНЬ</div>
        <h2>
          Встретимся
          <br />
          <em>{weddingDate.monthIn}</em>
        </h2>
        <p>
          Обведите эту дату в календаре.
          <br />
          Для нас она станет началом
          <br />
          самой красивой главы.
        </p>
        <div className="date-number">{weddingDate.format()}</div>
      </div>
      <div className="calendar">
        <div className="calendar-title">
          {weddingDate.monthName} <span>{weddingDate.year}</span>
        </div>
        <div className="calendar-grid">
          {weekdays.map((day) => (
            <span className="weekday" key={day}>
              {day}
            </span>
          ))}
          {Array.from({ length: weddingDate.firstWeekday }, (_, i) => (
            <span key={`empty-${i}`} />
          ))}
          {Array.from({ length: weddingDate.daysInMonth }, (_, i) => {
            const day = i + 1
            const isWeddingDay = day === weddingDate.day
            return (
              <span
                key={day}
                className={isWeddingDay ? 'wedding-day' : ''}
                aria-label={
                  isWeddingDay
                    ? `${weddingDate.full} — день свадьбы`
                    : undefined
                }
              >
                {day}
                {isWeddingDay && (
                  <svg viewBox="0 0 70 65" aria-hidden="true">
                    <path d="M35 58C-17 28 12-5 35 15 61-7 90 29 35 58Z" />
                  </svg>
                )}
              </span>
            )
          })}
        </div>
        <div className="calendar-note">
          {weddingDate.weekday}, которое мы будем помнить
        </div>
      </div>
    </section>
  )
}
