import { wedding } from '../config/wedding'

const date = new Date(wedding.date)
const parts = new Intl.DateTimeFormat('en-GB', {
  timeZone: wedding.timeZone,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}).formatToParts(date)
const part = (name: Intl.DateTimeFormatPartTypes) =>
  parts.find((item) => item.type === name)!.value
const day = Number(part('day'))
const month = Number(part('month'))
const year = Number(part('year'))

export const weddingDate = {
  monthIn: [
    'в январе',
    'в феврале',
    'в марте',
    'в апреле',
    'в мае',
    'в июне',
    'в июле',
    'в августе',
    'в сентябре',
    'в октябре',
    'в ноябре',
    'в декабре',
  ][month - 1],
  day,
  year,
  monthName: new Intl.DateTimeFormat('ru', {
    month: 'long',
    timeZone: wedding.timeZone,
  }).format(date),
  full: new Intl.DateTimeFormat('ru', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: wedding.timeZone,
  }).format(date),
  weekday: new Intl.DateTimeFormat('ru', {
    weekday: 'long',
    timeZone: wedding.timeZone,
  }).format(date),
  daysInMonth: new Date(Date.UTC(year, month, 0)).getUTCDate(),
  firstWeekday: (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7,
  format: (separator = '.') =>
    [part('day'), part('month'), part('year')].join(separator),
}
