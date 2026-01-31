import axios from "axios";

import { useState } from "react";

import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  SimpleGrid,
  Input,
  Group,
  Field,
  Popover,
  Icon,
  Portal,
} from "@chakra-ui/react";

import { IoMdCheckmark } from "react-icons/io";

import NavBar from "./NavBar";

type HubProps = {
  dashboards: any[]; // temporary
  getDashboardData: () => Promise<void>;
  ownerId: number;
};

export default function Hub({
  dashboards,
  getDashboardData,
  ownerId,
}: HubProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [createdDashName, setCreatedDashName] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // handles whether the input field for dashboard creation is visible, + button is shown when false
  const handleInputVisibility = () => {
    setIsVisible(true);
  };

  // handles changes to input field value for naming new dashboard
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatedDashName(e.target.value);
  };

  // used to create dashboards
  const handleCreate = async () => {
    // create dashboard with name from user input
    try {
      await axios.post("/dashboard", {
        ownerId,
        name: createdDashName,
      });
    } catch (err) {
      console.error("Failed to create dashboard", err);
    }
    setIsVisible(false); // change input field back to a + button
    getDashboardData(); // render dashboard data without client refresh
    setCreatedDashName(""); // clear input field
  };

  // used to send user to edit page for selected dashboard
  // TODO coordinate with dashboard editor team to finish this function
  const handleEdit = async (dashboardId: number) => {};

  // used to set dashboard as default for a user
  // TODO come back to this later, will need to grab primary dash info from user, pass down from App as prop?
  const handleSetDefault = (dashboardId: number) => {
    // toggle checkmark for that selected default
    setIsDefault(!isDefault);
    // will need to patch primary dashboard for user
  };

  // used to set a dashboard's layout as public
  // TODO coordinate with layout team to finish function
  const handlePublishLayout = () => {};

  // used to set a dashboard's theme as public
  // TODO coordinate with theme team to finish function
  const handlePublishTheme = () => {};

  // used to delete dashboards
  const handleDelete = async (dashboardId: number) => {
    // delete dashboard
    try {
      await axios.delete(`/dashboard/${dashboardId}`);
    } catch (err) {
      console.error("Failed to delete dashboard", err);
    }
    getDashboardData(); // render dashboard data without client refresh
  };

  // used to navigate to dashboard after click
  // TODO coordinate with team to give button navigation functionality
  const openDashboard = (dashboardId: number) => {

  }

  return (
    <>
    <NavBar pages={["Home"]}/> {/*empty string will take user to Home page*/}

    <Flex minH="100vh" justify="center">
      <Box w="100%" maxW="1100px" p={6}>
        {/* Profile */}
        <VStack gap={3} mb={6}>
          <Box
            w="96px"
            h="96px"
            borderRadius="full"
            border="1px solid"
            borderColor="gray.600"
          />

          <HStack gap={2}>
            <Box
              px={4}
              py={1}
              border="1px solid"
              borderColor="gray.600"
              borderRadius="md"
            >
              <Text>Username</Text>
            </Box>
            <Button size="xs" variant="outline">
              Edit
            </Button>
          </HStack>
        </VStack>

        {/* Defaults + Connected Accounts */}
        <HStack align="stretch" gap={6} mb={6}>
          {/* Defaults */}
          <Box
            flex="1"
            border="1px solid"
            borderColor="gray.600"
            borderRadius="lg"
            p={4}
          >
            <Text fontWeight="bold" mb={3}>
              Defaults
            </Text>

            <HStack gap={3} mb={4}>
              <Button size="sm" variant="outline">
                Dashboard #1
              </Button>
            </HStack>
          </Box>

          {/* Connected Accounts */}
          <Box
            flex="1"
            border="1px solid"
            borderColor="gray.600"
            borderRadius="lg"
            p={4}
            maxH="230px"
            overflowY="auto"
          >
            <Text fontWeight="bold" mb={3}>
              Connected Accounts
            </Text>

            <VStack gap={3}>
              {[1, 2, 3, 4, 5].map((i) => (
                <HStack
                  key={i}
                  w="100%"
                  p={2}
                  border="1px solid"
                  borderColor="gray.600"
                  borderRadius="md"
                >
                  <Box
                    w="32px"
                    h="32px"
                    border="1px solid"
                    borderColor="gray.600"
                    borderRadius="md"
                  />
                  <Text flex="1">Username</Text>
                  <Box
                    w="32px"
                    h="20px"
                    border="1px solid"
                    borderColor="gray.600"
                    borderRadius="full"
                  />
                </HStack>
              ))}

              <Button size="sm">+</Button>
            </VStack>
          </Box>
        </HStack>

        {/* Dashboards */}
        <Box
          border="1px solid"
          borderColor="gray.600"
          borderRadius="lg"
          p={4}
          mb={6}
          overflowY="auto"
        >
          <Text fontWeight="bold" mb={3}>
            Dashboards
          </Text>

          <Box maxH="300px">
            <SimpleGrid columns={4} gap={4}>
              {dashboards.map((dashboard) => (
                <Box
                  as="button"
                  cursor="pointer"
                  key={dashboard.id}
                  position="relative" // key for absolute menu button
                  h="120px"
                  border="1px solid"
                  borderColor="gray.600"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  p={2}
                  _hover={{ borderColor: "blue.500" }}
                  onClick={() => { openDashboard(dashboard.id); console.log('clicked') }}
                >
                  <Text pointerEvents="none">{dashboard.name}</Text>

                  {/* Top-right menu */}
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        position="absolute"
                        top="2"
                        right="2"
                        onClick={(e) => {
                          // don't allow ... menu click to trigger dashboard click
                          e.stopPropagation();
                        }}
                      >
                        •••
                      </Button>
                    </Popover.Trigger>

                    <Portal>
                      <Popover.Positioner>
                        <Popover.Content minW="150px">
                          <Popover.Body p={0}>
                            <VStack align="stretch" gap={0}>
                              <Button
                                size="sm"
                                variant="ghost"
                                justifyContent="flex-start"
                                onClick={() => handleEdit(dashboard.id)}
                              >
                                Edit
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                justifyContent="flex-start"
                                onClick={() => handleSetDefault(dashboard.id)}
                              >
                                {isDefault && (
                                  <Icon as={IoMdCheckmark} boxSize={4} mr={2} />
                                )}
                                Set as Default
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                justifyContent="flex-start"
                                onClick={handlePublishLayout}
                              >
                                Publish Layout
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                justifyContent="flex-start"
                                onClick={handlePublishTheme}
                              >
                                Publish Theme
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                justifyContent="flex-start"
                                color="red.500"
                                onClick={() => handleDelete(dashboard.id)}
                              >
                                Delete
                              </Button>
                            </VStack>
                          </Popover.Body>
                        </Popover.Content>
                      </Popover.Positioner>
                    </Portal>
                  </Popover.Root>
                </Box>
              ))}

              {/* Create Dashboard button */}
              <Button
                h="120px"
                border="1px solid"
                borderColor="gray.600"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="2xl"
                mb={4}
                onClick={handleInputVisibility}
              >
                {isVisible ? (
                  <Field.Root w="full">
                    <Field.Label>
                      Dashboard Name <Field.RequiredIndicator />
                    </Field.Label>

                    <Group attached w="full" maxW="sm">
                      <Input
                        flex="1"
                        placeholder=""
                        onChange={handleInputChange}
                        value={createdDashName}
                      />

                      <Button
                        variant="outline"
                        bg="bg.subtle"
                        minW="fit-content"
                        onClick={handleCreate}
                      >
                        Create
                      </Button>
                    </Group>
                  </Field.Root>
                ) : (
                  "+"
                )}
              </Button>
            </SimpleGrid>
          </Box>
        </Box>

        {/* Delete */}
        <Flex justify="center">
          <Button variant="outline" bg="red.500">
            Delete Account
          </Button>
        </Flex>
      </Box>
    </Flex>
    </>
  );
}
