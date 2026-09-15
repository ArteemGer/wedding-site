import { wedding } from '../config/wedding'
export function Location() {
  return (
    <section className="location section">
      <div className="location-art" aria-hidden="true">
        <div className="arch">
          <svg viewBox="0 0 260 300" fill="none">
            <path
              d="M30 263h200M45 263V134l85-60 85 60v129M75 263V156h110v107M108 263v-72a22 22 0 0 1 44 0v72M40 137h180M69 156v-25m30 25v-45m31 45V92m31 64v-45m30 45v-25"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M20 279h220M83 175h14m67 0h14M83 196h14m67 0h14"
              stroke="currentColor"
            />
          </svg>
        </div>
        <span>место для тёплых воспоминаний</span>
      </div>
      <div className="location-copy">
        <div className="eyebrow">МЕСТО ВСТРЕЧИ</div>
        <h2>
          Там, где будут
          <br />
          <em>наши люди</em>
        </h2>
        <p className="address">{wedding.address}</p>
        <p>
          Точное место встречи и подробности
          <br />
          мы сообщим дополнительно.
        </p>
        <span className="small-rule" />
      </div>
    </section>
  )
}
