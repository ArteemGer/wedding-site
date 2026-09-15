import { weddingDate } from '../utils/weddingDate'
import { wedding } from '../config/wedding'
import { Photo } from '../components/Photo'
export function Hero() {
  return (
    <section className="hero" id="home">
      <div className="eyebrow">ПРИГЛАШЕНИЕ НА НАШУ СВАДЬБУ</div>
      <h1>
        <span>{wedding.firstName}</span>
        <i>&</i>
        <span>{wedding.secondName}</span>
      </h1>
      <div className="childhood">
        <figure className="polaroid left">
          <Photo src={wedding.groomPhoto} label="Детское фото жениха" />
          <figcaption>тот самый мальчик</figcaption>
        </figure>
        <div className="handwritten">
          Кто бы мог
          <br /> подумать…
          <svg viewBox="0 0 100 65" aria-hidden="true">
            <path d="M10 5Q75 0 79 48m-15-9 15 12 8-16" />
          </svg>
        </div>
        <figure className="polaroid right">
          <Photo src={wedding.bridePhoto} label="Детское фото невесты" />
          <figcaption>та самая девочка</figcaption>
        </figure>
      </div>
      <div className="hero-bottom">
        <span>{wedding.city.toUpperCase()}</span>
        <a href="#invitation" aria-label="Читать приглашение">
          ↓
        </a>
        <span>{weddingDate.format(' / ')}</span>
      </div>
    </section>
  )
}
