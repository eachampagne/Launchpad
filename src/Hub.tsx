import axios from "axios";
import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router";
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
  Portal,
  NativeSelect,
} from "@chakra-ui/react";
import { GrEdit } from "react-icons/gr";
import { IoTrashSharp } from "react-icons/io5";
import { UserContext } from "./UserContext";
import NavBar from "./NavBar";
import Notifications from "./Notifications";
import Accounts from "./Accounts";

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

export default function Hub(
 // TODO will be changed when App component is completed
) {
  const [isVisible, setIsVisible] = useState(false);
  const [createdDashName, setCreatedDashName] = useState("");
  const [mode, setMode] = useState<"ALWAYS" | "CUSTOM">("ALWAYS");
  const [scheduleDraft, setScheduleDraft] = useState<ScheduleDraft[]>([]);
  const [editingAlways, setEditingAlways] = useState(false);
  const [dashboards, setDashboards] = useState([] as any[]);
  const [schedules, setSchedules] = useState([] as any[]);
  console.log(schedules)

  const { user: {id: ownerId, primaryDashId: primaryDashIdContext, name: username}, activeDash, setActiveDash: handleDashboardSelection, getPrimaryDash: refreshPrimaryDash } = useContext(UserContext);

  const [primaryDashId, setPrimaryDashId] = useState(primaryDashIdContext); // the context value is the 'real' value. PrimaryDashId is a local value used to track which value is selected in the scheduler

  useEffect(() => {
    setPrimaryDashId(primaryDashIdContext); // if the value in the context changes (such as by triggering a refresh, update the local value to match)
  }, [primaryDashIdContext]);

  const navigate = useNavigate();

    /**
   * Used to get current dashboard data from database
   */
  const getDashboardData = useCallback(async () => {
    
    try {
      const res = await axios.get(`/dashboard/all/${ownerId}`);
      setDashboards(res.data);
    } catch (error) {
      console.error("There was a problem getting user's dashboards", error);
    }
  }, [ownerId]);

  // get dashboard data on initial render
  useEffect(() => {
    if (ownerId === -1) return; // TODO come back to update this once established

    (async () => {
      getDashboardData();
    })();
  }, [ownerId, getDashboardData]);

  const getScheduledDashboardsData = useCallback(async () => {

    try {
      const res = await axios.get(`/schedule/${ownerId}`)
      console.log(res)
      setSchedules(res.data)
    } catch (error) {
      console.error("There was a problem getting user's scheduled dashboards", error);
    }
  }, [ownerId])

  // retrieve scheduled dashboards on initial render
  useEffect(() => {
    (async () => {
      getScheduledDashboardsData();
    })();
  }, [getScheduledDashboardsData]);

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

  /**
   * 
   * @param dashboardId 
   * Handles deleting a dashboard
   */
  const handleDelete = async (dashboardId: number) => {

    try {
      await axios.delete(`/dashboard/${dashboardId}`);
      // refresh primary dashboard data if user deletes their active primary dash
      if (primaryDashId === dashboardId) {
        refreshPrimaryDash();
      }
    } catch (err) {
      console.error("Failed to delete dashboard", err);
    }
    getDashboardData();
  };

  /**
   * 
   * @param dashboardId 
   * Handles changing primary dashboard for user in database.
   * Triggered by Save button in "Always" mode for Defaults section
   */
  const handleSetDefault = async (dashboardId: number) => {
    try {
      // change primary dashboard for user in 
      await axios.patch(`/dashboard/primary/${ownerId}`, { primaryDashId: dashboardId });
      // delete any existing scheduled dashboard changes
      await axios.delete(`/schedule/all/${ownerId}`);
      // refresh dashboard data
      getDashboardData();
      // reset edit status
      setEditingAlways(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCustomSchedule = async (s: ScheduleDraft) => {
  if (!s.dashboardId) return;

  const hour24 =
    s.period === "PM" ? (Number(s.hour) % 12) + 12 : Number(s.hour) % 12;

  const time = `${hour24.toString().padStart(2, "0")}:${s.minute.padStart(
    2,
    "0",
  )}`;

  try {
    await axios.post("/schedule", {
      ownerId,
      dashboardId: s.dashboardId,
      time,
    });

    // Remove draft input
    setScheduleDraft((prev) => prev.filter((x) => x.id !== s.id));

    // Refresh backend schedules so saved version renders
    await getScheduledDashboardsData();
  } catch (err) {
    console.error(err);
  }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
  try {
    await axios.delete(`/schedule/${scheduleId}`);

    // refresh backend schedules
    await getScheduledDashboardsData();
  } catch (err) {
    console.error("Failed to delete schedule", err);
  }
};

  // used to set a dashboard's layout as public
  // TODO coordinate with layout team to finish function
  const handlePublishLayout = () => {};

  // used to set a dashboard's theme as public
  // TODO coordinate with theme team to finish function
  const handlePublishTheme = () => {};

  // used to navigate to dashboard after click
 function OpenDashboard(dashboardId: number) {
    
    handleDashboardSelection(dashboardId)
    navigate("/dashboard", { replace: true })
  };


  return (
    <>
      <NavBar pages={["Home", "Dashboard"]} />{" "}
      {/*empty string will take user to Home page*/}
      <Flex minH="100vh" justify="center">
        <Box w="100%" maxW="1800px" p={6}>
          {/* Profile */}
          <VStack gap={3} mb={6}>
            {/* <Box
              w="96px"
              h="96px"
              borderRadius="full"
              border="1px solid"
              borderColor="gray.600"
            /> */}
          </VStack>

          {/* Defaults + Notifications + Connected Accounts */}
          <HStack align="stretch" gap={6} mb={6}>
            {/* Defaults */}
            <Box
              flex="1"
              h="280px"
              overflowY="auto"
              border="1px solid"
              borderColor="gray.600"
              borderRadius="lg"
              p={4}
            >
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="bold">Primary Dashboard Schedule</Text>
                {mode === "CUSTOM" && (
                  <Button
                    size="xs"
                    onClick={() =>
                      setScheduleDraft((s) => [createDraft(), ...s])
                    }
                  >
                    +
                  </Button>
                )}
                {mode === "ALWAYS" &&
                  primaryDashId !== null &&
                  !editingAlways && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setEditingAlways(true)}
                    >
                      <GrEdit />
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

                    if (value === "ALWAYS") {
                      setScheduleDraft([]);
                    }
                  }}
                >
                  <option value="ALWAYS">Always</option>
                  <option value="CUSTOM">Scheduled Dashboards</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>

              {/* ALWAYS MODE */}
              {mode === "ALWAYS" && (
                <HStack gap={3} mb={4} align="center">
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      value={primaryDashId ?? ""}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setPrimaryDashId(value);
                      }}
                      style={{ minWidth: "200px" }}
                      aria-disabled={primaryDashId !== null && !editingAlways}
                      pointerEvents={
                        primaryDashId !== null && !editingAlways
                          ? "none"
                          : "auto"
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
                    (primaryDashId === null || editingAlways) && (
                      <Button
                        size="sm"
                        onClick={() =>
                          primaryDashId && handleSetDefault(primaryDashId)
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
                  {/* Saved schedules from backend */}
                  {schedules.map((s) => (
                    <HStack key={`saved-${s.id}`} gap={3} align="center">
                      <Box flex="1">
                        <Text minW="90px">{s.time}</Text>
                      </Box>
                      <Box flex="1">
                        <Text>{s.dashboard?.name}</Text>
                      </Box>
                      <Button
                        size="xs"
                        colorPalette="red"
                        variant="ghost"
                        onClick={() => handleDeleteSchedule(s.id)}
                      >
                        <IoTrashSharp />
                      </Button>
                    </HStack>
                  ))}

                  {/* Draft schedules created with + */}
                  {scheduleDraft.map((s) => (
                    <HStack key={`draft-${s.id}`} gap={3} align="center">
                      <HStack>
                        <Input
                          w="60px"
                          value={s.hour}
                          onChange={(e) =>
                            setScheduleDraft((prev) =>
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
                            setScheduleDraft((prev) =>
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
                              setScheduleDraft((prev) =>
                                prev.map((x) =>
                                  x.id === s.id
                                    ? {
                                        ...x,
                                        period: e.target.value as "AM" | "PM",
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
                            setScheduleDraft((prev) =>
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
                        onClick={() => {
                          console.log("clicked", s);
                          handleSaveCustomSchedule(s);
                        }}
                      >
                        Save
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>
            {/* Notifications */}
            <Box
              flex="1"
              border="1px solid"
              borderColor="gray.600"
              borderRadius="lg"
              p={4}
              h="280px"
              overflowY="auto"
            >
              <Text fontWeight="bold" mb={3}>
                Notifications
              </Text>
              <VStack gap={3}>
                <HStack
                  w="100%"
                  p={2}
                  border="1px solid"
                  borderColor="gray.600"
                  borderRadius="md"
                >
                  {/* do stuff here azaria*/}
                  <Notifications ownerId={ownerId} />
                </HStack>
              </VStack>
            </Box>
            {/* Connected Accounts */}
            <Box
              flex="1"
              border="1px solid"
              borderColor="gray.600"
              borderRadius="lg"
              p={4}
              h="280px"
              overflowY="auto"
            >
              <Text fontWeight="bold" mb={3}>
                Connected Accounts
              </Text>
              <Accounts />
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

            <Box maxH="400px">
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
                    onClick={() => {
                      OpenDashboard(dashboard.id);
                    }}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePublishLayout();
                                  }}
                                >
                                  Publish Layout
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  justifyContent="flex-start"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePublishTheme();
                                  }}
                                >
                                  Publish Theme
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  justifyContent="flex-start"
                                  color="red.500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(dashboard.id);
                                  }}
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
        </Box>
      </Flex>
    </>
  );
}
