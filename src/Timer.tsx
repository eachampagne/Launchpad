import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

import { Button, For, Flex, Heading, HStack, Icon, Text } from '@chakra-ui/react';
import { LuTimer } from 'react-icons/lu';

import { TimerStatus } from '../types/WidgetStatus';

function Timer() {
  // should you be able to use the timer just client side if you're logged out?
  const [timerStatus, setTimerStatus] = useState(TimerStatus.SignedOut);
  const [expiration, setExpiration] = useState(null as Date | null);
  const [pausedRemaining, setPausedRemaining] = useState(null as number | null);

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
        setExpiration(response.data);
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

  const handleStartTimerButton = (event: React.MouseEvent<HTMLButtonElement>) => {
    // separate this out instead of going straight to start timer
    // because in the future you may be able to input the duration in a field yourself
    // and possibly still use the quick start buttons
    const duration = parseInt((event.target as HTMLButtonElement).value);
    startTimer(duration);
  };


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
            <Text marginBottom="0.5rem">Resume timer:</Text>
          </>
        );
        break;
      case TimerStatus.ActiveTimer:
        return (
          <>
            <Text marginBottom="0.5rem">Remaining time:</Text>
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