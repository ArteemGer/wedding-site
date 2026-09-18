import { dressColors } from '../config/wedding'
export function DressCode() {
  return (
    <section className="dress section">
      <div className="eyebrow">НЕМНОГО О КРАСИВОМ</div>
      <h2>Дресс-код</h2>
      <p>
        Главное для нас — ваше присутствие и улыбки.
        <br /> Нам будет особенно приятно, если в ваших нарядах
        <br /> найдут отражение оттенки нашего дня.
      </p>
      <div className="swatches">
        {dressColors.map(({ color, label }) => (
          <div key={color}>
            <span style={{ background: color }} />
            <small>{label}</small>
          </div>
        ))}
      </div>
      <div className="dress-note">
        <span>♡</span>
        <p>
          Будем рады, если для своих нарядов вы выберете оттенки нашей палитры —
          от светло-голубого до глубокого синего. <br /> Если вам будет
          комфортнее прийти в классическом чёрном, можно дополнить образ
          деталями в цветах нашего дня.
        </p>
      </div>
    </section>
  )
}
