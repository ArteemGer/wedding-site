import { giftWish } from '../config/wedding'

export function GiftWish() {
  return (
    <section className="gift-wish section" aria-labelledby="gift-wish-title">
      <div className="gift-wish-content">
        <h2 id="gift-wish-title">{giftWish.title}</h2>
        {giftWish.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  )
}
