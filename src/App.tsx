import { Header } from './components/Header'
import { useScrollReveal } from './hooks/useScrollReveal'
import { Hero } from './sections/Hero'
import { Invitation } from './sections/Invitation'
import { WeddingDate } from './sections/WeddingDate'
import { Location } from './sections/Location'
import { DressCode } from './sections/DressCode'
import { GiftWish } from './sections/GiftWish'
import { Rsvp } from './sections/Rsvp'
import { Countdown } from './sections/Countdown'
import { Farewell } from './sections/Farewell'
import './App.css'
export default function App() {
  const pageRef = useScrollReveal()
  return (
    <>
      <Header />
      <main ref={pageRef}>
        <Hero />
        <Invitation />
        <WeddingDate />
        <Location />
        <DressCode />
        <GiftWish />
        <Rsvp />
        <Countdown />
        <Farewell />
      </main>
    </>
  )
}
