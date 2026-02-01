import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

import { Button, Flex, For, Heading, Icon, LinkBox, LinkOverlay, ScrollArea, Stack, Text } from '@chakra-ui/react';
import { LuMail } from 'react-icons/lu';

import { AuthStatus } from '../types/AuthStatus.ts';

function Email () {
  const [authStatus, setAuthStatus] = useState(AuthStatus.SignedOut);
  const [emails, setEmails] = useState([] as {id: string, snippet: string}[]);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/checkauth/gmail');
      if (response.data === true) {
        setAuthStatus(AuthStatus.Authorized);
        getEmails();
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
  };

  const getEmails = async () => {
    try {
      const response = await axios.get('/email');
      setEmails(response.data);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    }
  };

  const renderEmails = () => {
    switch(authStatus) {
      case AuthStatus.Authorized:
        return (
          <ScrollArea.Root>
            <ScrollArea.Viewport>
              <ScrollArea.Content>
                <Stack>
                  <For
                    each={emails}
                    fallback={<Text>No emails to show.</Text>}
                  >
                    {(email) => <Text>{email.snippet}</Text>}
                  </For>
                </Stack>
              </ScrollArea.Content>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar>
              <ScrollArea.Thumb />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner />
          </ScrollArea.Root>
        );
        break;
      case AuthStatus.Unauthorized:
        return (
          <LinkBox>
            <Button>
              <LinkOverlay href='/auth/gmail'>Authorize Gmail</LinkOverlay>
            </Button>
          </LinkBox>
        );
        break;
      case AuthStatus.SignedOut:
        return <Text>Please sign in.</Text>;
        break;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Flex direction="column" height="100%">
      <Flex align="center" marginBottom="0.5rem"> {/* Inner flex box means icon is vertically centered against text */}
        <Icon size="lg" marginRight="0.5rem">
          <LuMail/>
        </Icon>
        <Heading>
          Email
        </Heading>
      </Flex>
      {renderEmails()}
    </Flex>
  );
}

export default Email;