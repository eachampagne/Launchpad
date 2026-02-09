import { useState, useEffect } from 'react';
import { Accordion, Button, Flex, For, Spacer, Text, VStack } from '@chakra-ui/react';

import axios from 'axios';

import type { Permission, Account } from '../types/Accounts';

function Accounts() {
  const [accounts, setAccounts] = useState([] as Account[]);

  const refreshAccounts = async () => {
    console.log('refreshing accounts');
    try {
      const response = await axios.get('/accounts');
  
      setAccounts(response.data);
    } catch (error) {
      // TODO: handle not signed in
      // if ((error as AxiosError).status === 401) {
        
      // }
      console.error('Failed to get account information:', error);
    }

  };

  useEffect(() => {
    refreshAccounts();
  }, []);

  return (
    <Accordion.Root collapsible>
      <For
        each={accounts}
      >
        {(account) => (
          <Accordion.Item value={account.name}>
            <Accordion.ItemTrigger>
              <Flex
                width="100%"
                align="center"
                px={2}
                py={4}
                border="1px solid"
                borderColor="gray.600"
                borderRadius="md"
              >
                <Accordion.ItemIndicator />
                <Text mx="2">{account.name}</Text>
                <Spacer />
                <Button asChild size="2xs" rounded="full">
                  {
                    account.unlinkable
                      ? <a href={account.unlinkURL}>Unlink</a>
                      : <a href="" data-disabled="" onClick={(e) => e.preventDefault()} >Unlink</a>
                  }
                </Button>
              </Flex>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody>
                <VStack>
                  <For
                    each={account.permissions}
                  >
                    {(permission) => (
                      <Flex width="100%" px={2}>
                        <Text>{permission.name}</Text>
                        <Spacer />
                        <Button asChild size="2xs" rounded="full" colorPalette="green" variant={permission.authorized ? "outline" : undefined}>
                          {
                            permission.authorized
                              ? <a href="" onClick={(e) => e.preventDefault()}>Authorized</a>
                              : <a href={permission.authURL}>Authorize</a>
                          }
                        </Button>
                      </Flex>
                    )}
                  </For>
                </VStack>
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        )}
      </For>
    </Accordion.Root>
  );
}

export default Accounts;