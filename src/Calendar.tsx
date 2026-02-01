import { useState, useEffect, type ChangeEvent } from 'react';

import axios, { AxiosError } from 'axios';

import { Button, Flex, For, Heading, Icon, LinkBox, LinkOverlay, NativeSelect, ScrollArea, Text, VStack } from '@chakra-ui/react';
import { LuCalendarDays } from 'react-icons/lu';


import type { Event, CalendarObject } from '../types/Calendar.ts';
import { AuthStatus } from '../types/AuthStatus.ts';

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
        <NativeSelect.Root variant={'subtle'}>
          <NativeSelect.Field onChange={handleCalendarSelect}>
            <For
              each={calendars}
              fallback={<Text w="100%">No calendars found.</Text>}
            >
              { (calendar) => <option value={calendar.id}>{calendar.summary}</option>}
            </For>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      )
    } else {
      return null;
    }
  };

  const renderEvents = () => {
    switch (authStatus) {
      case AuthStatus.SignedOut:
        return <Text w="100%">Please sign in.</Text>;
        break;
      case AuthStatus.Unauthorized:
        // LinkBox/LinkOverlay mean the whole button, not just the text, functions as a link
        return (
          <LinkBox>
            <Button>
              <LinkOverlay href='/auth/calendar'>Authorize Calendar</LinkOverlay>
            </Button>
          </LinkBox>
        )
        break;
      case AuthStatus.Authorized:
        return (
          <ScrollArea.Root marginTop="0.5rem">
            <ScrollArea.Viewport>
              <ScrollArea.Content>
                <VStack>
                  <For
                    each={events}
                    fallback={<Text w="100%">No events found.</Text>}
                  >
                    {(event) => (
                        <Text w="100%">{event.summary}</Text>
                      )
                    }
                  </For>
                </VStack>
              </ScrollArea.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar>
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner />
          </ScrollArea.Root>
        );
      break;
    }

  };

  return (
    <Flex direction="column" height="100%">
      <Flex align="center" marginBottom="0.5rem"> {/* Inner flex box means icon is vertically centered against text */}
        <Icon size="lg" marginRight="0.5rem">
          <LuCalendarDays/>
        </Icon>
        <Heading>
          Calendar
        </Heading>
      </Flex>
      {renderCalendarList()}
      {renderEvents()}
    </Flex>
  );
}

export default Calendar;
