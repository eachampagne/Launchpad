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
} from "@chakra-ui/react";

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
  console.log(isVisible);
  const handleInputVisibility = () => {
    setIsVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatedDashName(e.target.value);
  };

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

  return (
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
        >
          <Text fontWeight="bold" mb={3}>
            Dashboards
          </Text>

          <Box maxH="300px" overflowY="auto">
            <SimpleGrid columns={4} gap={4}>
              {dashboards.map((dashboard) => (
                <Button
                  key={dashboard.id}
                  h="120px"
                  variant="ghost"
                  border="1px solid"
                  borderColor="gray.600"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text>{dashboard.name}</Text>
                </Button>
              ))}

              <Button
                h="120px"
                border="1px solid"
                borderColor="gray.600"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="2xl"
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
          <Button variant="outline" colorScheme="red">
            Delete Account
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
