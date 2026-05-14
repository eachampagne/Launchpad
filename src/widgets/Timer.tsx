import { useState, useEffect, useEffectEvent, useContext, useRef } from 'react';
import axios, { AxiosError } from 'axios';

import { Button, For, Flex, Heading, HStack, Icon, NumberInput, Text } from '@chakra-ui/react';
import { LuTimer, LuVolume2, LuVolumeOff } from 'react-icons/lu';

import type { WidgetSettings } from '../../types/LayoutTypes.ts';
import { TimerStatus } from '../../types/WidgetStatus.ts';
import { UserContext } from '../UserContext.tsx';
import changeTextColor from '../utilities/color.ts';
import { Toaster, toaster } from '../components/ui/toaster'

import soundUrl from './../assets/triangle.mp3';
// constantly recreating it is bad performance wise, but also means its muted/unmuted status doesn't persist

function Timer({widgetId, widgetColor, settings}: {widgetId: number, widgetColor: string, settings: WidgetSettings | null}) {
  const { user } = useContext(UserContext);

  const textColor = changeTextColor(widgetColor);
  const buttonText = changeTextColor(widgetColor, "white", "black");
  const colorMode = changeTextColor(widgetColor, "dark", "light"); // affects number inputs

  // this was helpful: https://stackoverflow.com/questions/55198517/react-usestate-why-settimeout-function-does-not-have-latest-state-value
  const audioElement = useRef(new Audio(soundUrl)); // don't recreate every rerender
  const tickInterval = useRef(null as null | number);
  const timerTimeout = useRef(null as null | number);

  // should you be able to use the timer just client side if you're logged out?
  const [timerStatus, setTimerStatus] = useState(TimerStatus.SignedOut);
  const [expiration, setExpiration] = useState(null as Date | null);
  const [timerString, setTimerString] = useState('');
  const [pausedRemaining, setPausedRemaining] = useState(null as number | null);
  const [muted, setMuted] = useState(false);
  const [notiAllowed, setNotiAllowed] = useState(false);
  const [countToast, setCountToast] = useState(0);

  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');

  // check timer, assign states
  const checkServer = async () => {
    // reset minutes and seconds for custom times
    setMinutes('0');
    setSeconds('0');

    // if no user, don't bother sending a request
    if (user.id === -1) {
      setTimerStatus(TimerStatus.SignedOut);
      return;
    }

    try {
      const response = await axios.get(`/timer/${widgetId}`);
      if (!response.data) { // even though it's sending null on the server side, it comes through as an empty string
        // I assume because null isn't serializable
        setTimerStatus(TimerStatus.NoTimer);
        setPausedRemaining(null);
        setExpiration(null);
      } else {
        const { paused, remainingMs }: { paused: boolean, remainingMs: number } = response.data;

        if (paused) {
          setTimerStatus(TimerStatus.Paused);
          setPausedRemaining(remainingMs);
          setExpiration(null);
        } else {
          if (remainingMs < 0) { // timer has already expired - basically counts as no timer
            // the server should no longer send expired timers, but this is just in case
            setTimerStatus(TimerStatus.NoTimer);
            setPausedRemaining(null);
            setExpiration(null);
            return;
          }

          setTimerStatus(TimerStatus.ActiveTimer);
          const expirationResponse = new Date(Date.now() + remainingMs);
          setExpiration(expirationResponse);
          setPausedRemaining(null);
        }
      }
    } catch (error) {
      if ((error as AxiosError).status === 401) {
        setTimerStatus(TimerStatus.SignedOut);
        setPausedRemaining(null);
        setExpiration(null);
      } else {
        console.error('Failed to check timer status:', error);
      }
    }
  };

  const startTimer = async (duration: number) => {
    try {
      await axios.post(`/timer/${widgetId}`, {duration});
      checkServer();
    } catch (error) {
      console.error('Failed to start new timer:', error);
    }

    setCountToast(0);
  };

  const tick = () => {
    setTimerString(expiresToString(expiration as Date));
  }

  const stopTicking = () => {
    if (tickInterval.current !== null) {
      clearInterval(tickInterval.current);
      tickInterval.current = null;
    }
  }

  const startTicking = () => {
    if (tickInterval.current !== null) {
      clearInterval(tickInterval.current);
    }
    tickInterval.current = setInterval(tick, 100);
  }

  const pause = async () => {
    if (expiration === null) {
      return;
    }

    try {
      await axios.patch(`/timer/pause/${widgetId}`);
      checkServer();
    } catch (error) {
      console.error('Failed to pause timer:', error);
    }
  };

  const resume = async () => {
    if (pausedRemaining === null) {
      return;
    }

    try {
      await axios.patch(`/timer/resume/${widgetId}`);
      checkServer(); // resets expiration, which triggers ticking to start
    } catch (error) {
      console.error('Failed to resume timer:', error);
    }
  };

  const reset = async () => {
    try {
      await axios.delete(`/timer/${widgetId}`);
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

  const handleStartCustomTimer = () => {
    const duration = parseInt(minutes) * 60 * 1000 + parseInt(seconds) * 1000;
    startTimer(duration);
  }

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
  };

  const checkNotiStatus = () => {

      axios.get(`/notifications/${user.id}`)
        .then(response => {
          const { noti } = response.data.data;
          console.log(response, 'hi')
          setNotiAllowed(noti);
        })
        .catch(error => {
          console.error('Failed to fetch phone number settings:', error);
      });


      console.log(notiAllowed)
  }

  const handleTimeUp = () => {
    audioElement.current.play();
    checkServer();



    if(notiAllowed === true && countToast === 0){
      toaster.create({
      title: "Timer Finished!",
      description: "Your timer is up!",
      })

      setCountToast((c) => c + 1)
    }

    // toaster.create({
    // title: "Timer Finished!",
    // description: "Your timer is up!",
    // })
    // axios.get(`/phoneNumbers/${user.id}`)
    //     .then(response => {
    //       const { noti } = response.data.data;
    //       if (noti) {
    //         toaster.create({
    //           title: "Timer Finished!",
    //           description: "Your timer is up!",
    //         });
    //       }
    //     })
    //     .catch(error => {
    //       console.error('Failed to fetch phone number settings:', error);
    //     });
  
  }

  const handleUnmount = () => {
    // clear timeouts/intervals before unmounting
    if (timerTimeout.current !== null) {
      clearTimeout(timerTimeout.current);
      timerTimeout.current = null;
    }
    stopTicking();
  };

  const toggleMute = () => {
    audioElement.current.muted = !muted; // avoid closure issues with the handleTimeUp function
    setMuted(m => !m);
  }

  const resetClockDisplay = useEffectEvent(() => {
    stopTicking();

    if (timerTimeout.current !== null) {
      clearTimeout(timerTimeout.current);
    }

    if (expiration !== null) {
      const remainingMs = expiration.getTime() - Date.now();
      timerTimeout.current = setTimeout(handleTimeUp, remainingMs);
      setTimerString(expiresToString(expiration));
      startTicking();
    } else if (pausedRemaining !== null) {
      setTimerString(timeToString(pausedRemaining));
      timerTimeout.current = null;
    }
  });

  useEffect(() => {
    resetClockDisplay();
  }, [expiration, pausedRemaining]);

  useEffect(() => {
    checkServer();
    checkNotiStatus();
  }, [user]);

  useEffect(() => {
    // cleanup - don't ring if the widget is offscreen (navigated to a different page, deleted widget, etc)
    return () => {
      handleUnmount();
    };
    // needs to create a new cleanup process when timerTimeout changes to prevent thinking timerTimeout is still null due to closure
  }, [timerTimeout]);

  const renderVolumeControl = () => {
      return (
        <Icon size="lg" marginLeft="0.5rem" onClick={toggleMute} cursor="pointer">
          {muted ? <LuVolumeOff/> : <LuVolume2/>}
        </Icon>
      );
  }

  const renderTimer = () => {
    switch (timerStatus) {
      case TimerStatus.SignedOut:
        return <Text>Please sign in.</Text>
        break;
      case TimerStatus.NoTimer:
        return (
          <>
            <Text marginBottom="0.5rem">Start a timer:</Text>
            <Flex justify="center" gap="0.5rem" mb="0.5rem">
              <NumberInput.Root
                w="75px"
                value={minutes}
                min={0}
                max={59}
                onValueChange={(e) => setMinutes(e.value)}
              >
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger color={textColor}/>
                  <NumberInput.DecrementTrigger color={textColor}/>
                </NumberInput.Control>
                <NumberInput.Input />
              </NumberInput.Root>
              <NumberInput.Root
                w="75px"
                value={seconds}
                min={0}
                max={59}
                onValueChange={(e) => setSeconds(e.value)}
              >
                <NumberInput.Control>
                  <NumberInput.IncrementTrigger color={textColor}/>
                  <NumberInput.DecrementTrigger color={textColor}/>
                </NumberInput.Control>
                <NumberInput.Input />
              </NumberInput.Root>
              <Button onClick={handleStartCustomTimer} bgColor={textColor} color={buttonText}>Start</Button>
            </Flex>
            <Flex justify="center" gap="0.5rem">
              <For
                each={[5, 25, 45]}
              >
                {(time) => {
                  return (
                    <Button
                      value={time * 60 * 1000}
                      onClick={handleStartTimerButton}
                      bgColor={textColor}
                      color={buttonText}
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
                        bgColor={textColor}
                        color={buttonText}
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
                        bgColor={textColor}
                        color={buttonText}
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
    <Flex direction="column" height="100%" color={textColor} className={colorMode}>
      <Flex align="center" marginBottom="0.5rem">
        <Icon size="lg" marginRight="0.5rem">
          <LuTimer/> {/* Would the alarm clock be better? */}
        </Icon>
        <Heading>
          Pomodoro Timer
        </Heading>
        {renderVolumeControl()}
      </Flex>
      {renderTimer()}
      <Toaster/>
    </Flex>
  );
}

export default Timer;