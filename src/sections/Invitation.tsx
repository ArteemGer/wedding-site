import { invitation, wedding } from '../config/wedding'
import { Photo } from '../components/Photo'

export function Invitation() {
  return (
    <section className="intro section" id="invitation">
      <div className="eyebrow">{invitation.eyebrow}</div>
      <h2>{invitation.title}</h2>
      {invitation.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <figure className="together">
        <Photo
          src={wedding.couplePhoto}
          label="Здесь будет наша общая фотография"
        />
        <figcaption className="handwritten">
          {invitation.photoCaption}
        </figcaption>
      </figure>
    </section>
  )
}
