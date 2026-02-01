import { useState, useEffect, type ChangeEvent } from 'react';

import axios, { AxiosError } from 'axios';

import type { Event, CalendarObject } from '../types/Calendar.ts';
import { AuthStatus } from '../types/WidgetStatus.ts';

function Calendar() {
  const [authStatus, setAuthStatus] = useState(AuthStatus.SignedOut);
  const [events, setEvents] = useState([] as Event[]);
  const [calendars, setCalendars] = useState([] as CalendarObject[]);
  const [activeCalendarId, setActiveCalendarId] = useState('');

  const checkAuth = async () => {
    try {
      const response = await axios.get('/checkauth/calendar');
      if (response.data === true) {
        setAuthStatus(AuthStatus.Authorized);
        getEvents();
        getCalendars();
      } else if (response.data === false) {
        setAuthStatus(AuthStatus.Unauthorized);
      } else {
        console.error('Unexpected response from auth check: expected true or false, got', response.data);
      }
    } catch (error) {
      if ((error as AxiosError).status === 401) {
        setAuthStatus(AuthStatus.SignedOut);
      } else {
        console.error('Failed to check auth status:', error);
      }
    }
  }

  const handleCalendarSelect = (event: ChangeEvent) => {
    const target = event.target as HTMLSelectElement;
    getEvents(target.value);
  }

  const getEvents = async (calendarId = '') => {
    const query = calendarId ? `?calendarId=${encodeURIComponent(calendarId)}` : ''; //apparently one of the Google calendars has a pound sign

    try {
      const response = await axios.get(`/calendar${query}`);
      setEvents(response.data);
      setActiveCalendarId(calendarId);
    } catch (error) {
      console.error('Failed to get calendar events:', error);
    }
  };

  const getCalendars = async () => {
    try {
      const response = await axios.get('/calendar/list');
      setCalendars(response.data);
    } catch (error) {
      console.error('Failed to get calendars:', error);
    }
  }

  useEffect(() => {
    // TODO: if Calendar inherits a user through props, it may be possible to skip checking auth if we know the user is signed out
    checkAuth();
  }, []);

  const renderCalendarList = () => {
    if (authStatus === AuthStatus.Authorized) {
      return (
        <select onChange={handleCalendarSelect}>
          {calendars.map(calendar => {
            return <option value={calendar.id}>{calendar.summary}</option>;
          })}
        </select>
      )
    } else {
      return null;
    }
  };

  const renderEvents = () => {
    switch (authStatus) {
      case AuthStatus.SignedOut:
        return <p>Please sign in.</p>;
        break;
      case AuthStatus.Unauthorized:
        return (
          <a href='/auth/calendar'>Authorize Calendar</a>
        )
        break;
      case AuthStatus.Authorized:
        if (events.length > 0) {
          return events.map((event) => {
            return (
              <div>
                <p>{event.summary}</p>
              </div>
            )
          });
        } else {
          return <p>No events found.</p>;
        }
        break;
    }

  };

  return (
    <div>
      <h6>Calendar</h6>
      {renderCalendarList()}
      {renderEvents()}
    </div>
  );
}

export default Calendar;
