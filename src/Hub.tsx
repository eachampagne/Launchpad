
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  SimpleGrid,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@chakra-ui/react";


import { useState } from "react";

type HubProps = {
  dashboards: any[]; // temporary
};

export default function Hub({ dashboards }: HubProps) {
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newDashboardName, setNewDashboardName] = useState("");

  const handleCreateDashboard = () => {
    console.log("Dashboard name:", newDashboardName);
    // Here you would trigger your API call
    setNewDashboardName(""); // reset input
    onClose(); // close modal
  };

  console.log(dashboards);
  if (!dashboards || dashboards.length === 0) {
    return <p>Loading dashboards...</p>;
  }
  return (
    <>
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
                onClick={onOpen}
              >
                +
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

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Dashboard</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Dashboard Name"
              value={newDashboardName}
              onChange={(e) => setNewDashboardName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCreateDashboard}>
              Create
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
</>
  );
}
