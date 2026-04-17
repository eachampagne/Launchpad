import { useState, useEffect, useContext} from 'react';
import axios from 'axios';

import { Box, Button, Center, Flex, For, Heading, ScrollArea, SimpleGrid, Spinner, Text } from '@chakra-ui/react';

import { UserContext } from './UserContext';

// This is not the same as the Dashboard type in types, because the response from
// /dashboard/all/:id doesn't include the full layout
// in fact the response will have more data than this, but this is what is essential
type Dashboard = {
  name: string;
  id: number;
}

function SelectDashMenu () {
  const {setActiveDash, user: {id: userId}} = useContext(UserContext);

  const [loading, setLoading] = useState(false);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);

  const selectDash = (id: number) => {
    setActiveDash(id);
  };

  const createNewDash = async () => {
    try {
      const response = await axios.post('/dashboard', {
        name: 'Untitled dashboard',
        ownerId: userId
      });

      if (response?.data?.id) {
        setActiveDash(response.data.id);
      }
    } catch (error) {
      console.error('Failed to create dashboard:', error);
    }
  }

  const fetchDashboards = async () => {
    if (userId === -1) return; // not signed in

    try {
      setLoading(true);
      const response = await axios.get(`/dashboard/all/${userId}`);

      setDashboards(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboards:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, [userId]);

  const renderGridSelection = () => {
    if (loading) {
      return <Spinner color="blue.500" animationDuration="0.8s" />;
    }

    return (
      <ScrollArea.Root my="5px">
        <ScrollArea.Viewport
          css={{
            "--scroll-shadow-size": "20px",
            maskImage: "linear-gradient(#000, #000)",
            "&[data-overflow-y]": {
              maskImage:
                "linear-gradient(#000,#000,transparent 0,#000 var(--scroll-shadow-size),#000 calc(100% - var(--scroll-shadow-size)),transparent)",
              "&[data-at-top]": {
                maskImage:
                  "linear-gradient(180deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)",
              },
              "&[data-at-bottom]": {
                maskImage:
                  "linear-gradient(0deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)",
              },
            },
          }}
        >
          <ScrollArea.Content p="20px">
            <SimpleGrid minChildWidth="300px" gap="40px">
              <For
                each={dashboards}
                fallback={<Text>No dashboards available.</Text>}
              >
                {(dashboard) => (
                  // box styling from Hub page, thanks Jaylin
                  <Box
                    as="button"
                    cursor="pointer"
                    key={dashboard.id}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    p={2}
                    h="120px"
                    border="1px solid"
                    borderColor="gray.600"
                    borderRadius="sm"
                    _hover={{ borderColor: "blue.500" }}
                    onClick={() => selectDash(dashboard.id)}
                    bgColor="black"
                  >
                    <Text pointerEvents="none">{dashboard.name}</Text>
                  </Box>
                )}
              </For>
            </SimpleGrid>
          </ScrollArea.Content>
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    );
  };

  // not logged in - user will be redirected to homepage
  // don't render anything to ensure no flash
  if (userId === -1){
    return null;
  }

  return (
    <Flex
      w="80%"
      maxHeight="80%"
      p="32px"
      overflow="scroll"
      direction="column"
      className="glass-hub-box"
    >
      <Center>
        <Heading>No Dashboard Selected</Heading>
      </Center>
      <Text>Choose a dashboard:</Text>
      {renderGridSelection()}
      <Center>
        <Button
          onClick={createNewDash}
          width="164px"
          mt="10px"
        >
          Create New Dashboard
        </Button>
      </Center>
      <Flex gap="20px" alignContent="center" justifyContent="center" mt="10px">
        <Button asChild width="72px">
          <a href='/'>Home</a>
        </Button>
        <Button asChild width="72px">
          <a href='/hub'>Hub</a>
        </Button>
      </Flex>
    </Flex>
  );
}

export default SelectDashMenu;