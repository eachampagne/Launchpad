// https://stackoverflow.com/questions/37688318/typescript-interface-possible-to-make-one-or-the-other-properties-required

interface EventBase {
  summary: string,
  id: string
}

interface AllDayTime {
  date: string,
  dateTime?: never,
  timeZone?: never
}

interface PartDayTime {
  date?: never,
  dateTime: string,
  timeZone: string
}

interface EventAllDay extends EventBase {
  start: AllDayTime,
  end: AllDayTime
}

interface EventPartDay extends EventBase {
  start: PartDayTime,
  end: PartDayTime
}

export type Event = EventAllDay | EventPartDay;

export type CalendarObject = {
  id: string,
  summary: string,
  description: string
}

export type ThemeObject = {
  id: number,
  navColor: string,
  bgColor: string,
  font: string
}