import { wedding } from '../config/wedding'
export function Location() {
  return (
    <section className="location section">
      <figure className="location-art">
        <div className="arch">
          <img
            src={wedding.placePhoto}
            alt="Зал для проведения нашей свадьбы"
            width={960}
            height={1280}
            loading="lazy"
            decoding="async"
          />
        </div>
        <figcaption>место для тёплых воспоминаний</figcaption>
      </figure>
      <div className="location-copy">
        <div className="eyebrow">МЕСТО ВСТРЕЧИ</div>
        <h2>
          Там, где будут
          <br />
          <em>наши люди</em>
        </h2>
        <p className="address">{wedding.address}</p>
        <p className="location-time">
          Сбор гостей состоиться в <time dateTime={wedding.time}>{wedding.time}</time>
        </p>
        <span className="small-rule" />
      </div>
    </section>
  )
}
