import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

import { Button, For, Flex, Heading, HStack, Icon, Text } from '@chakra-ui/react';
import { LuTimer } from 'react-icons/lu';

import { TimerStatus } from '../types/WidgetStatus';

function Timer() {
  // should you be able to use the timer just client side if you're logged out?
  const [timerStatus, setTimerStatus] = useState(TimerStatus.SignedOut);
  const [expiration, setExpiration] = useState(null as Date | null);
  const [timerString, setTimerString] = useState('');
  const [pausedRemaining, setPausedRemaining] = useState(null as number | null);
  const [tickTimeout, setTickTimeout] = useState(null as null | number);

  // check timer, assign states
  const checkServer = async () => {
    try {
      const response = await axios.get('/timer');
      if (!response.data) { // even though it's sending null on the server side, it comes through as an empty string
        // I assume because null isn't serializable
        if (pausedRemaining === null) {
          setTimerStatus(TimerStatus.NoTimer);
        } else {
          setTimerStatus(TimerStatus.Paused);
        }
      } else {
        setTimerStatus(TimerStatus.ActiveTimer);

        const expirationResponse = new Date(response.data);

        setExpiration(expirationResponse);
      }
    } catch (error) {
      if ((error as AxiosError).status === 401) {
        setTimerStatus(TimerStatus.SignedOut);
      } else {
        console.error('Failed to check timer status:', error);
      }
    }
  };

  const startTimer = async (duration: number) => {
    try {
      await axios.post('/timer', {duration});
      checkServer();
    } catch (error) {
      console.error('Failed to start new timer:', error);
    }
  };

  const tick = () => {
    setTimerString(expiresToString(expiration as Date));
    setTickTimeout(setTimeout(tick, 100)); // 10 times a second
  }

  const stopTicking = () => {
    if (tickTimeout !== null) {
      clearTimeout(tickTimeout);
      setTickTimeout(null);
    }
  }

  const startTicking = () => {
    stopTicking();
    setTickTimeout(setTimeout(tick, 100));
  }

  const pause = async () => {
    if (expiration === null) {
      return;
    }

    try {
      await axios.delete('/timer');
      const remainingMs = expiration.getTime() - Date.now();
      setPausedRemaining(remainingMs);
      setTimerString(timeToString(remainingMs));
      setExpiration(null);
      await checkServer(); // the pausedRemaining state hasn't always updated so sometime it thinks there is no timer
      setTimerStatus(TimerStatus.Paused);
    } catch (error) {
      console.error('Failed to pause timer:', error);
    }
  };

  const resume = async () => {
    if (pausedRemaining === null) {
      return;
    }

    try {
      await axios.post('/timer', {duration: pausedRemaining});
      setPausedRemaining(null);
      checkServer(); // resets expiration, which triggers ticking to star
    } catch (error) {
      console.error('Failed to resume timer:', error);
    }
  };

  const reset = async () => {
    if (pausedRemaining !== null) {
      setPausedRemaining(null);
    }

    if (expiration === null) {
      setTimerStatus(TimerStatus.NoTimer);
      return;
    }

    try {
      await axios.delete('/timer');
      setExpiration(null);
      checkServer();
    } catch (error) {
      console.error('Failed to delete timer:', error);
    }
  };

  const expiresToString = (expires: Date) => {
    const now = Date.now();

    const remainingMs = expires.getTime() - now;

    return timeToString(remainingMs);
  };

  const timeToString = (remainingMs: number) => {
    let negative = false;

    if (remainingMs < 0) {
      negative = true;
      remainingMs = -remainingMs;
    }

    const seconds = Math.trunc(remainingMs / 1000) % 60;
    const minutes = Math.trunc(remainingMs / 1000 / 60) % 60;
    const hours = Math.trunc(remainingMs / 1000 / 60 / 60);

    const secondsString = seconds === 0 ? '00'
      : seconds < 10 ? `0${seconds}` : `${seconds}`;
    const minutesString = minutes === 0 ? '00'
      : minutes < 10 ? `0${minutes}` : `${minutes}`;
    const hoursString = hours > 0 ? `${hours}:` : '';
    const negativeString = negative ? '-' : '';

    const string = `${negativeString}${hoursString}${minutesString}:${secondsString}`;

    return string;
  };

  const handleStartTimerButton = (event: React.MouseEvent<HTMLButtonElement>) => {
    // separate this out instead of going straight to start timer
    // because in the future you may be able to input the duration in a field yourself
    // and possibly still use the quick start buttons
    const duration = parseInt((event.target as HTMLButtonElement).value);
    startTimer(duration);
  };

  const handleControlButton = (event: React.MouseEvent<HTMLButtonElement>) => {
    const action = (event.target as HTMLButtonElement).value;

    switch (action) {
      case 'pause':
        pause();
        break;
      case 'resume':
        resume();
        break;
      case 'reset':
        reset();
        break;
      default:
        console.error('Unknown action:', action);
        break;
    }
  }

  useEffect(() => {
    stopTicking();
    if (expiration !== null) {
      setTimerString(expiresToString(expiration));
      startTicking();
    }
  }, [expiration]);

  useEffect(() => {
    checkServer();
  }, []);

  const renderTimer = () => {
    switch (timerStatus) {
      case TimerStatus.SignedOut:
        return <Text>Please sign in.</Text>
        break;
      case TimerStatus.NoTimer:
        return (
          <>
            <Text marginBottom="0.5rem">Start a timer:</Text>
            <Flex justify="center" gap="0.5rem">
              <For
                each={[5, 25, 45]}
              >
                {(time) => {
                  return (
                    <Button
                      value={time * 60 * 1000}
                      onClick={handleStartTimerButton}
                    >
                      {time} m
                    </Button>
                  );
                }}
              </For>
            </Flex>
          </>
        );
        break;
      case TimerStatus.Paused:
        return (
          <>
            <Text marginBottom="0.5rem">Paused timer: {timerString}</Text>
            <Flex justify="center">
              <HStack>
                <For
                  each={['resume', 'reset']}
                >
                  {(action) => {
                    return (
                      <Button
                        value={action}
                        onClick={handleControlButton}
                      >
                        {action[0].toUpperCase() + action.slice(1)}
                      </Button>
                    )
                }}
                </For>
              </HStack>
            </Flex>
          </>
        );
        break;
      case TimerStatus.ActiveTimer:
        return (
          <>
            <Text marginBottom="0.5rem">Remaining time: {timerString}</Text>
            <Flex justify="center">
              <HStack>
                <For
                  each={['pause', 'reset']}
                >
                  {(action) => {
                    return (
                      <Button
                        value={action}
                        onClick={handleControlButton}
                      >
                        {action[0].toUpperCase() + action.slice(1)}
                      </Button>
                    )
                }}
                </For>
              </HStack>
            </Flex>
          </>
        );
        break;
    }
  }

  return (
    <Flex direction="column" height="100%">
      <Flex align="center" marginBottom="0.5rem">
        <Icon size="lg" marginRight="0.5rem">
          <LuTimer/> {/* Would the alarm clock be better? */}
        </Icon>
        <Heading>
          Pomodoro Timer
        </Heading>
      </Flex>
      {renderTimer()}
    </Flex>
  );
}

export default Timer;