import { weddingDate } from '../utils/weddingDate'
import { wedding } from '../config/wedding'
import { useCountdown } from '../hooks/useCountdown'
export function Countdown() {
  const countdown = useCountdown(wedding.date)
  return (
    <section className="countdown section">
      <div className="eyebrow">СЧИТАЕМ МГНОВЕНИЯ</div>
      <h2>До нашего «да» осталось</h2>
      <div
        className="timer"
        role="timer"
        aria-label={`Время до ${weddingDate.full} по Москве`}
      >
        {countdown.map((value, i) => (
          <div key={i}>
            <span>{String(value).padStart(2, '0')}</span>
            <small>{['дней', 'часов', 'минут', 'секунд'][i]}</small>
          </div>
        ))}
      </div>
    </section>
  )
}
