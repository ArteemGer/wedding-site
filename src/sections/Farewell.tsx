import { weddingDate } from '../utils/weddingDate'
import { wedding } from '../config/wedding'
export function Farewell() {
  return (
    <footer className="section">
      <span className="footer-heart" aria-hidden="true">
        ♡
      </span>
      <h2>До встречи!</h2>
      <p>
        Этот день будет ещё прекраснее,
        <br />
        потому что рядом будете вы.
      </p>
      <div className="footer-sign">
        С любовью, {wedding.firstName} и {wedding.secondName}
      </div>
      <div className="footer-date">{weddingDate.format(' • ')}</div>
    </footer>
  )
}
