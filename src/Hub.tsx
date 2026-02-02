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
  NativeSelect,
} from "@chakra-ui/react";
import { IoMdCheckmark } from "react-icons/io";
import NavBar from "./NavBar";

type HubProps = {
  dashboards: any[]; // temporary
  getDashboardData: () => Promise<void>;
  ownerId: number;
  activeDash: number | null;
};

type ScheduleDraft = {
  id: string; // backend schedule.id once saved, temporary UUID before saving
  dashboardId: number | null;
  hour: string;
  minute: string;
  period: "AM" | "PM";
  saved?: boolean; // true if persisted to backend
};

// function to create a NEW local draft 
const createDraft = (): ScheduleDraft => ({
  id: crypto.randomUUID(),
  dashboardId: null,
  hour: "6",
  minute: "00",
  period: "AM",
  saved: false,
});

export default function Hub({
  dashboards,
  getDashboardData,
  ownerId,
  activeDash, // TODO will be changed when App component is completed
}: HubProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [createdDashName, setCreatedDashName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [mode, setMode] = useState<"ALWAYS" | "CUSTOM">("ALWAYS");
  const [schedules, setSchedules] = useState<ScheduleDraft[]>([]);
  const [editingAlways, setEditingAlways] = useState(false);

  const handleInputVisibility = () => {
    setIsVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatedDashName(e.target.value);
  };

  const handleCreate = async () => {
    try {
      await axios.post("/dashboard", {
        ownerId,
        name: createdDashName,
      });
    } catch (err) {
      console.error("Failed to create dashboard", err);
    }
    setIsVisible(false);
    getDashboardData();
    setCreatedDashName("");
  };

  const handleDelete = async (dashboardId: number) => {
    try {
      await axios.delete(`/dashboard/${dashboardId}`);
    } catch (err) {
      console.error("Failed to delete dashboard", err);
    }
    getDashboardData();
  };

  const handleSetDefault = async (dashboardId: number) => {
    try {
      await axios.patch("", { ownerId, dashboardId });
      await axios.delete("", { data: { ownerId } });
      getDashboardData();
      setEditingAlways(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCustomSchedule = async (s: ScheduleDraft) => {
    if (!s.dashboardId) return;
    const hour24 =
      s.period === "PM" ? (Number(s.hour) % 12) + 12 : Number(s.hour) % 12;
    const time = `${hour24.toString().padStart(2, "0")}:${s.minute.padStart(2, "0")}`;
    try {
      await axios.post("/schedule", {
        ownerId,
        dashboardId: s.dashboardId,
        time,
      });
      setSchedules((prev) =>
        prev.map((x) => (x.id === s.id ? { ...x, saved: true } : x)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Loader function to fetch schedules from backend


  // used to send user to edit page for selected dashboard
  // TODO coordinate with dashboard editor team to finish this function
  const handleEdit = async (dashboardId: number) => {};

  // used to set a dashboard's layout as public
  // TODO coordinate with layout team to finish function
  const handlePublishLayout = () => {};

  // used to set a dashboard's theme as public
  // TODO coordinate with theme team to finish function
  const handlePublishTheme = () => {};

  // used to navigate to dashboard after click
  // TODO coordinate with team to give button navigation functionality
  const openDashboard = (dashboardId: number) => {};

  return (
    <>
      <NavBar pages={["Home"]} /> {/*empty string will take user to Home page*/}
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
              minH="230px"
              overflowY="auto"
              border="1px solid"
              borderColor="gray.600"
              borderRadius="lg"
              p={4}
            >
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="bold">Defaults</Text>
                {mode === "CUSTOM" && (
                  <Button
                    size="xs"
                    onClick={() => setSchedules((s) => [createDraft(), ...s])}
                  >
                    +
                  </Button>
                )}
                {mode === "ALWAYS" && activeDash !== null && !editingAlways && (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setEditingAlways(true)}
                  >
                    ✎
                  </Button>
                )}
                {mode === "ALWAYS" && editingAlways && (
                  <Button size="xs" onClick={() => setEditingAlways(false)}>
                    Cancel
                  </Button>
                )}
              </HStack>

              {/* Mode selector */}
              <NativeSelect.Root mb={4}>
                <NativeSelect.Field
                  value={mode}
                  onChange={(e) => {
                    const value = e.target.value as "ALWAYS" | "CUSTOM";
                    setMode(value);

                    if (value === "CUSTOM" && schedules.length === 0) {
                      setSchedules([createDraft()]);
                    }

                    if (value === "ALWAYS") {
                      setSchedules([]);
                    }
                  }}
                >
                  <option value="ALWAYS">Always</option>
                  <option value="CUSTOM">Custom Time</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>

              {/* ALWAYS MODE */}
              {mode === "ALWAYS" && (
                <HStack gap={3} mb={4} align="center">
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      value={activeDash ?? ""}
                      onChange={(e) => {}} // preventing react warning
                      style={{ minWidth: "200px" }}
                      aria-disabled={activeDash !== null && !editingAlways}
                      pointerEvents={
                        activeDash !== null && !editingAlways ? "none" : "auto"
                      }
                    >
                      <option value="" disabled>
                        Select dashboard
                      </option>
                      {dashboards.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>

                  {mode === "ALWAYS" &&
                    (activeDash === null || editingAlways) && (
                      <Button
                        size="sm"
                        onClick={() =>
                          activeDash && handleSetDefault(activeDash)
                        }
                      >
                        Save
                      </Button>
                    )}
                </HStack>
              )}

              {/* CUSTOM MODE */}
              {mode === "CUSTOM" && (
                <VStack gap={3} align="stretch">
                  {schedules.map((s) => (
                    <HStack key={s.id} gap={3} align="center">
                      {s.saved ? (
                        <>
                          {/* time (left) */}
                          <Text minW="90px">
                            {s.hour}:{s.minute} {s.period}
                          </Text>

                          {/* dashboard name (right) */}
                          <Text flex="1">
                            {
                              dashboards.find((d) => d.id === s.dashboardId)
                                ?.name
                            }
                          </Text>
                        </>
                      ) : (
                        <>
                          <HStack>
                            <Input
                              w="60px"
                              value={s.hour}
                              onChange={(e) =>
                                setSchedules((prev) =>
                                  prev.map((x) =>
                                    x.id === s.id
                                      ? { ...x, hour: e.target.value }
                                      : x,
                                  ),
                                )
                              }
                            />

                            <Text>:</Text>

                            <Input
                              w="60px"
                              value={s.minute}
                              onChange={(e) =>
                                setSchedules((prev) =>
                                  prev.map((x) =>
                                    x.id === s.id
                                      ? { ...x, minute: e.target.value }
                                      : x,
                                  ),
                                )
                              }
                            />

                            <NativeSelect.Root>
                              <NativeSelect.Field
                                value={s.period}
                                onChange={(e) =>
                                  setSchedules((prev) =>
                                    prev.map((x) =>
                                      x.id === s.id
                                        ? {
                                            ...x,
                                            period: e.target.value as
                                              | "AM"
                                              | "PM",
                                          }
                                        : x,
                                    ),
                                  )
                                }
                              >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                              </NativeSelect.Field>
                              <NativeSelect.Indicator />
                            </NativeSelect.Root>
                          </HStack>

                          <NativeSelect.Root>
                            <NativeSelect.Field
                              value={s.dashboardId ?? ""}
                              onChange={(e) => {
                                const value = Number(e.target.value) || null;
                                setSchedules((prev) =>
                                  prev.map((x) =>
                                    x.id === s.id
                                      ? { ...x, dashboardId: value }
                                      : x,
                                  ),
                                );
                              }}
                              style={{ minWidth: "180px" }}
                            >
                              <option value="" disabled>
                                Select dashboard
                              </option>
                              {dashboards.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name}
                                </option>
                              ))}
                            </NativeSelect.Field>
                            <NativeSelect.Indicator />
                          </NativeSelect.Root>

                          <Button
                            size="sm"
                            onClick={() => handleSaveCustomSchedule(s)}
                          >
                            Save
                          </Button>
                        </>
                      )}
                    </HStack>
                  ))}
                </VStack>
              )}
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
                    position="relative"
                    h="120px"
                    border="1px solid"
                    borderColor="gray.600"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    p={2}
                    _hover={{ borderColor: "blue.500" }}
                    onClick={() => openDashboard(dashboard.id)}
                  >
                    <Text pointerEvents="none">{dashboard.name}</Text>

                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          position="absolute"
                          top="2"
                          right="2"
                          onClick={(e) => e.stopPropagation()}
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
                                    <Icon
                                      as={IoMdCheckmark}
                                      boxSize={4}
                                      mr={2}
                                    />
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
