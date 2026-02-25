import type { Event, CalendarObject } from '../../types/Calendar.ts';

const demoCalendarList = [
  {
    id: 'primary',
    summary: 'Primary',
    description: 'the primary demo calendar',
    primary: true
  },
  {
    id: 'secondary',
    summary: 'Secondary',
    description: 'the secondary demo calendar',
  }
] as CalendarObject[];

const demoPrimaryCalendar = [
  {
    summary: 'Showcase Day!',
    id: 'fulldaydemo',
    start: {
      date: '2026-03-05',
    },
    end: {
      date: '2026-03-05',
    }
  },
  {
    summary: 'Thesis Showcase',
    id: 'partdaydemo',
    start: {
      dateTime: '2026-03-05T17:30:00-06:00',
      timeZone: 'America/Chicago'
    },
    end: {
      dateTime: '2026-03-05T19:30:00-06:00',
      timeZone: 'America/Chicago'
    }
  }
] as Event[];

const demoSecondaryCalendar = [
  {
    summary: 'Celebrate!',
    id: 'fulldaysecondary',
    start: {
      date: '2026-03-06',
    },
    end: {
      date: '2026-03-06',
    }
  },
  {
    summary: 'Apply to awesome tech jobs',
    id: 'partdaysecondary',
    start: {
      dateTime: '2026-03-06T10:00:00-06:00',
      timeZone: 'America/Chicago'
    },
    end: {
      dateTime: '2026-03-06T17:00:00-06:00',
      timeZone: 'America/Chicago'
    }
  }
] as Event[];

// functions are async for parity with API calls

export async function getDemoCalendarList() {
  return demoCalendarList;
}

export async function getDemoCalendarEvents(calendarId: string) {
  switch (calendarId) {
    case 'primary':
      return demoPrimaryCalendar;
    case 'secondary':
      return demoSecondaryCalendar;
    default:
      return null;
  }
}