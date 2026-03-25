import { useState, useEffect, useContext, type ChangeEvent } from 'react';
import axios from 'axios';
import { AbsoluteCenter, Box, Button, Center, Container, Flex, Grid, GridItem, Heading, Icon, IconButton, ScrollArea, Spinner, VStack } from "@chakra-ui/react";
import { LuCheck, LuPencil } from "react-icons/lu";

import NavBar from "./NavBar";
import Theme from './Theme';
import LayoutGallery from './LayoutGallery';
import LayoutCanvas from './LayoutCanvas';
import WidgetLibrary from "./WidgetLibrary";
import { UserContext } from './UserContext';

import changeTextColor from './utilities/color.ts'
import type { ThemeObject } from '../types/Calendar';
import type { Layout, Dashboard } from '../types/LayoutTypes';

export default function Dashboard () {
  const { activeDash, user: { id: ownerId } } = useContext(UserContext);

  const [editMode, setEditMode] = useState(false);
  const [themeId, setThemeId] = useState(-1);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [theme, setTheme] = useState({} as ThemeObject);
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [selectedLayoutId, setSelectedLayoutId] = useState(-1);//(-1 = nothing selected)
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null)

  const handleChangeNewName = (event: ChangeEvent) => {
    const target = event.target as unknown as HTMLInputElement; // whyyyyy
    setNewName(target.value);
  };

  const handleCancelRename = () => {
    setRenaming(false);
    setNewName(dashboard?.name || '');
  }

  const loadDashboard = async () => {
    // not a real dash
    if (activeDash === -1) {
      return;
    }

    try {
      const response = await axios.get(`/dashboard/${activeDash}`);
      // originally, the /dashboard/:id route didn't include the theme data, so omit the theme from the dashboard state var
      const { theme, ...dashboard } = response.data;
      setDashboard(dashboard);
      setNewName(dashboard.name);
      setTheme(theme);
      setThemeId(dashboard.themeId);
    } catch (error) {
      console.error('Failed to get dashboard:', error);
    }
  };

  const refreshTheme = async () => {
    // not a real theme
    if (themeId === -1) {
      return;
    }

    try {
      const response = await axios.get(`/theme/${themeId}`);
      if (!response) {
        console.error('Failed to refresh theme: no response');
        return;
      }
      setTheme(response.data);
    } catch (error) {
      console.error('Failed to refresh theme:', error);
    }
  };

  //Will create a clone of applied layout
  const applyLayout = async (layoutId: number) => {
    try {
      //Update dashboard
      const response = await axios.post(`/dashboard/${activeDash}/layout/${layoutId}`)
      console.log('Dashboard updated:', response.data)
      //Reload dash
      //loadDashboard();
      // the post request doesn't include the theme
      const dashboard = response.data;
      setDashboard(dashboard)
    } catch (error) {
      console.error('Failed to use layout:', error);
    }
  }

  const renameDashboard = async () => {
    if (newName === dashboard?.name) {
      setRenaming(false);
      return; // don't bother sending a request if it won't change anything
    }

    try {
      await axios.patch(`/dashboard/${activeDash}`, {name: newName})
      loadDashboard();
      setRenaming(false);
    } catch (error) {
      console.error('Failed to rename dashboard:', error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [activeDash]);

  useEffect(() => {
    if(selectedLayoutId === -1){
      return;
    }

    axios.get(`/layout/${selectedLayoutId}`)
    .then((res) => {
      setSelectedLayout(res.data);

    }).catch((err) => {
      console.error('Could not find your layout:', err);
    });
  }, [selectedLayoutId]);

  const renderEditButton = () => {
    return (
      <IconButton onClick={() => setEditMode(e => !e)} position="absolute" right="20px" top="20px">
        {editMode ? <LuCheck /> : <LuPencil />}
      </IconButton>
    );
  };

  const renderName = () => {
    if (!dashboard) return null;

    const nameHeight = "40px"; // avoid "bouncing" due to different sizes

    if (!editMode) {
      return (
        <Flex align="center" height={nameHeight}>
          <Heading>{dashboard.name}</Heading>
        </Flex>
      );
    }

    if (renaming) {
      return (
        <Flex align="center" height={nameHeight}>
          <input
          onChange={handleChangeNewName}
          value={newName}
          style={{
            color: "black",
            backgroundColor: "white",
            border: "1px solid #82de11",
            padding: "4px"
          }}
          />
          <Button onClick={renameDashboard}>Save</Button>
          <Button onClick={handleCancelRename}>Cancel</Button>
        </Flex>
      );
    } else {
      return (
        <Flex align="center" onClick={() => setRenaming(true)} height={nameHeight}>
          <Heading >{dashboard.name}</Heading>
          <Icon>
            <LuPencil />
          </Icon>
        </Flex>
      );
    }
  }

  const renderContent = () => {
    if (!dashboard) return null;

    if (!editMode) {
      return (
        <Grid>
          <GridItem>
            <LayoutCanvas
              layout={dashboard.layout}
              editable={editMode}
            />
          </GridItem>
        </Grid>
      );
    }

    return (
      <Grid
        templateRows={{xlDown: "repeat(2, 1fr)", '2xl': "repeat(1, 1fr)"}}
        templateColumns={{lgDown: "repeat(2, 1fr)", xl: "repeat(2, 1fr)", '2xl': "repeat(3, 1fr)"}}
      >
        <GridItem
          colSpan={{lgDown: 2, xl: 1, '2xl': 1}}
          rowSpan={{lgDown: 1, xl: 2, '2xl': 1}}
          order={{xlDown: 1, '2xl': 2}}
          minWidth={`${19*60}px`}
        >
          <LayoutCanvas
            layout={dashboard.layout}
            editable={editMode}
          />
        </GridItem>
        <GridItem
          colSpan={1}
          rowSpan={1}
          order={{xlDown: 2, '2xl': 1}}
          bgColor="black"
        >
          <Theme
            dashboardId={activeDash}
            dashboard={dashboard}
            ownerId={ownerId}
          />
        </GridItem>
        <GridItem
          colSpan={1}
          rowSpan={1}
          order={3}
          bgColor="black"
        >
          <Box mt={4}>
            <LayoutGallery
              onSelect={setSelectedLayoutId}
              selectedLayoutId={selectedLayoutId}
            />
          </Box>

          {selectedLayout && (
            <Box mt={4}>
              {/* <h4>LAYOUT PREVIEW</h4>
              <p>SELECTED LAYOUT #{selectedLayoutId}</p>
              <p>GRID SIZE: {selectedLayout.gridSize}</p> */}
              <button onClick={() => applyLayout(selectedLayout.id)}>
                APPLY SELECTED LAYOUT
              </button>
            </Box>
          )}
          {dashboard.layout && (
            <WidgetLibrary
              layoutId={dashboard.layout.id}
              onWidgetAdded={loadDashboard}
            />
          )}
        </GridItem>
      </Grid>
    );
  };

  // early return for loading state, guards against null dashboard
  if (!dashboard) {
    return (
      <Box width="full" position="relative" p="0" m="0">
        <NavBar pages={['Home', 'Hub']} />
        <AbsoluteCenter>
          <Spinner color="blue.500" animationDuration="0.8s"/>
        </AbsoluteCenter>
      </Box>
    );
  }


  return (
    <>
      <NavBar pages={['Home', 'Hub']} textColor={changeTextColor(theme.bgColor)} navColor={theme.navColor}/>
      {/* Use scroll area to make sure content won't exceed horizontal space, to make sure the navbar stays in the correct spot*/}
      <Box width="full" position="relative" p="0" m="0" bg={theme.bgColor} color="gray.800">
        <ScrollArea.Root width="100%">
          <ScrollArea.Viewport>
            <ScrollArea.Content position="relative">
              <Center>
                <VStack>
                  {renderName()}
                  {renderContent()}
                </VStack>
              </Center>
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="horizontal" />
          <ScrollArea.Corner />
        </ScrollArea.Root>
        {renderEditButton()}
      </Box>
    </>
  );
}