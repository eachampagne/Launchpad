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

/**
 * This enum is used to choose how to lay out the menus in edit mode, depending on screen size.
 * Each enum member corresponds to one arrangement.
 */
enum SettingsPosition {
  BothSides = 'BOTH_SIDES',
  RightSide = 'RIGHT_SIDE',
  Below = 'BELOW'
}

export default function Dashboard () {
  /**
   * LOCAL VARIABLES (some of which must be declared before some functions are)
   */

  // TODO: these should probably be stored in the dashboard object or something
  const columns = 19;
  const rows = 12;
  const snapSize = 60;

  const canvasWidth = columns * snapSize;
  const canvasHeight = rows * snapSize;
  const settingsWidth = 400;
  const spacing = 20;

  const oneSidebarBreakpoint = canvasWidth + spacing + settingsWidth;
  const twoSidebarBreakpoint = canvasWidth + 2 * (spacing + settingsWidth);

  // the media queries need to be declared before the first invocation of checkBreakpoints()
  // if we ever have variably-sized dashboards, these will need to be recreated when the dashboard changes
  const belowQuery = window.matchMedia(`(width < ${oneSidebarBreakpoint}px)`);
  const twoSidebarQuery = window.matchMedia(`(width >= ${twoSidebarBreakpoint}px)`);

  /**
   * CONTEXT VARIABLES
   */
  const { activeDash, user: { id: ownerId } } = useContext(UserContext);

  /**
   * STATE VARIABLES
   */
  const [editMode, setEditMode] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [theme, setTheme] = useState({} as ThemeObject);
  const [newName, setNewName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [selectedLayoutId, setSelectedLayoutId] = useState(-1);//(-1 = nothing selected)
  const [selectedLayout, setSelectedLayout] = useState<Layout | null>(null);
  const [settingsOrientation, setSettingsOrientation] = useState(checkBreakpoints());

  /**
   * EVENT HANDLERS
   */

  // handles typing in the dashboard name input
  const handleChangeNewName = (event: ChangeEvent) => {
    const target = event.target as unknown as HTMLInputElement; // whyyyyy
    setNewName(target.value);
  };

  // handles clicking the cancel button in the name editor
  const handleCancelRename = () => {
    setRenaming(false);
    setNewName(dashboard?.name || '');
  }

  // handles changing the settings layout when the screen size crosses a breakpoint
  const handleMediaChange = () => {
    setSettingsOrientation(checkBreakpoints())
  };

  /**
   * MISCELLANEOUS FUNCTIONS
   */

  // checks the media queries to set the correct settings orientation
  function checkBreakpoints () {
    if (twoSidebarQuery.matches) {
      return SettingsPosition.BothSides;
    } else if (belowQuery.matches) {
      return SettingsPosition.Below;
    } else {
      return SettingsPosition.RightSide;
    }
  }

  // loads a dashboard, including its theme
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
    } catch (error) {
      console.error('Failed to get dashboard:', error);
    }
  };

  // passed into the theme component, used to update the client when
  // switching or editing a theme.
  // Currently this just delegates to loadDashboard(), but we may in the 
  // future add a backend route that allows looking up just the theme
  // associated with a given dashboard rather than having to fetch the 
  // entire dashboard again.
  const refreshTheme = async () => {
    loadDashboard();

    // the following doesn't work because it uses the old themeId
    // well, maybe it works for editing a theme, but not for changing them
    // it would be nice to look up the current theme associated with a specific dashboard
    // we don't have a route for that at the moment

    // // not a real theme
    // if (themeId === -1) {
    //   return;
    // }

    // try {
    //   const response = await axios.get(`/theme/${themeId}`);
    //   if (!response) {
    //     console.error('Failed to refresh theme: no response');
    //     return;
    //   }
    //   setTheme(response.data);
    // } catch (error) {
    //   console.error('Failed to refresh theme:', error);
    // }
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

  // sends the request to rename the current dashboard
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

  /**
   * EFFECTS
   */

  // adds the media change listeners on mount and removes them on dismount
  useEffect(() => {
    // add event listeners to media queries after all relevant functions are defined
    belowQuery.addEventListener('change', handleMediaChange);
    twoSidebarQuery.addEventListener('change', handleMediaChange);

    // cleanup function: remove event listeners before unmounting
    return () => {
      belowQuery.removeEventListener('change', handleMediaChange);
      twoSidebarQuery.removeEventListener('change', handleMediaChange);
    };
  }, [belowQuery, twoSidebarQuery, handleMediaChange]);

  // loads a new dashboard when the dashboard id changes
  useEffect(() => {
    loadDashboard();
  }, [activeDash]);

  // fetches a new layout when the layout id changes
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

  /**
   * RENDER FUNCTIONS (split out parts of the full component into more easily understandable chunks)
   */

  // renders the edit/done button in the top right corner
  const renderEditButton = () => {
    return (
      <IconButton onClick={() => setEditMode(e => !e)} position="absolute" right="20px" top="20px">
        {editMode ? <LuCheck /> : <LuPencil />}
      </IconButton>
    );
  };

  // renders the name of the dashboard at the top, which can be changed while in edit mode
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
          onKeyDown={(event) => {
            // https://stackoverflow.com/questions/68979619/how-do-you-submit-on-enter-key-press-in-a-chakra-ui-input
            if (event.key === 'Enter') {
              renameDashboard();
            } else if (event.key === 'Escape') {
              handleCancelRename();
            }
          }}
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

  // renders the layout canvas
  const renderCanvas = () => {
    if (!dashboard) return null;

    return (
      <Box minWidth={`${columns*snapSize}px`}>
        <LayoutCanvas
          layout={dashboard.layout}
          editable={editMode}
          onLayoutChange={loadDashboard}
        />
      </Box>
    );
  };

  // renders the theme settings (theme library, theme editor, etc)
  const renderThemeSettings = () => {
    if (!dashboard) return null;

    return (
      <Theme
        dashboardId={activeDash}
        dashboard={dashboard}
        ownerId={ownerId}
        refreshTheme={refreshTheme}
      />
    );

  };

  // renders the layout settings (public layouts, widget library, etc)
  const renderLayoutSettings = () => {
    if (!dashboard) return null;

    return (
      <>
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
      </>
    );
  };

  // renders the grid containing the layout canvas and the theme and layout panels
  // in a configuration determined by the screen size and edit mode
  // it is important to ensure that the same instances of the components are rendered
  // in each configuration to reduce requests.
  // If each configuration renders its own instances of the settings panel and layout canvas,
  // then the new canvas renders all new widgets, which each send all of their requests again.
  // Using the grid allows the configuration to be changed using CSS alone, so it's still the same
  // component instance and the requests are not resent all over again.
  const renderContent = () => {
    if (!dashboard) return null;

    let settingsHeight;
    let themeBlockStyles, layoutBlockStyles, gridStyles, canvasBlockStyles;

    if (editMode) {
      switch (settingsOrientation) {
        case SettingsPosition.BothSides:
          settingsHeight = canvasHeight;
          gridStyles = { display: "grid", gridTemplateColumns: `repeat(3, fit-content(${canvasWidth}px))`, gridTemplateRows: `repeat(1, fit-content(${canvasHeight}px))`, gap: `${spacing}px` };
          canvasBlockStyles = { gridColumn: 2 };
          themeBlockStyles = {gridColumn: 1, gridRow: 1, maxWidth: `${settingsWidth}px`};
          layoutBlockStyles = {gridColumn: 3, gridRow: 1, maxWidth: `${settingsWidth}px`};
          break;
        case SettingsPosition.RightSide:
          settingsHeight = Math.ceil((canvasHeight - spacing) / 2);
          gridStyles = { display: "grid", gridTemplateColumns: `repeat(2, fit-content(${canvasWidth}px))`, gridTemplateRows: `repeat(2, fit-content(${(canvasHeight - spacing) / 2}px))`, gap: `${spacing}px` };
          canvasBlockStyles = { gridColumn: 1, gridRowStart: 1, gridRowEnd: "span 2" };
          themeBlockStyles = { gridColumn: 2, gridRow: 1, maxWidth: `${settingsWidth}px`, maxHeight: `${settingsHeight}px`};
          layoutBlockStyles = {gridColumn: 2, gridRow: 2, maxWidth: `${settingsWidth}px`, maxHeight: `${settingsHeight}px`};
          break;
        case SettingsPosition.Below:
          settingsHeight = 400; // arbitrary - just doesn't need to be huge or anything
          gridStyles = { display: "grid", gridTemplateColumns: `repeat(2, fit-content(${canvasWidth}px))`, gridTemplateRows: `repeat(2, fit-content(${canvasHeight}px))`, gap: `${spacing}px` };
          canvasBlockStyles = { gridColumnStart: 1, gridColumnEnd: "span 2" };
          themeBlockStyles = {gridColumn: 1, gridRow: 2, maxWidth: `${settingsWidth}px`};
          layoutBlockStyles = {gridColumn: 2, gridRow: 2, maxWidth: `${settingsWidth}px`};
          break;
      }
    } else {
      gridStyles = { display: "grid", gridTemplateColumns: `repeat(1, fit-content(${canvasWidth}px))`, gridTemplateRows: `repeat(1, fit-content(${canvasHeight}px))`, gap: `${spacing}px` };
      canvasBlockStyles = { gridColumn: 1 };
      themeBlockStyles = {display: "none"};
      layoutBlockStyles = {display: "none"};
      settingsHeight = 400; // doesn't matter
    }

    // I had a problem with the Chakra Grid component so I'm using the vanilla grid instead. It gives more direct control.
    return (
      <div style={gridStyles}>
        <div style={canvasBlockStyles}>
          {renderCanvas()}
        </div>
        <div style={themeBlockStyles}>
          <Box width={`${settingsWidth}px`} height={`${settingsHeight}px`} borderWidth="1px" borderRadius="md" p={4} borderColor="white">
            <ScrollArea.Root>
              <ScrollArea.Viewport>
                <ScrollArea.Content >
                  {renderThemeSettings()}
                </ScrollArea.Content>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar orientation="vertical" />
              <ScrollArea.Corner />
            </ScrollArea.Root>
          </Box>
        </div>
        <div style={layoutBlockStyles}>
          <Box width={`${settingsWidth}px`} height={`${settingsHeight}px`} borderWidth="1px" borderRadius="md" p={4} borderColor="white">
            <ScrollArea.Root>
              <ScrollArea.Viewport>
                <ScrollArea.Content >
                  {renderLayoutSettings()}
                </ScrollArea.Content>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar orientation="vertical" />
              <ScrollArea.Corner />
            </ScrollArea.Root>
          </Box>
        </div>
      </div>
    );
  };

  /**
   * THE COMPONENT OUTPUT
   */

  // early return for loading state, guards against null dashboard
  if (!dashboard) {
    return (
      <Box width="full" minH="100vh" position="relative" p="0" m="0">
        <NavBar pages={['Home', 'Hub']} />
        <AbsoluteCenter>
          <Spinner color="blue.500" animationDuration="0.8s"/>
        </AbsoluteCenter>
      </Box>
    );
  }

  // normal return
  return (
    <Box minH="100vh" bg={theme.bgColor}>
      <NavBar pages={['Home', 'Hub']} textColor={changeTextColor(theme.bgColor)} navColor={theme.navColor}/>
      {/* Use scroll area to make sure content won't exceed horizontal space, to make sure the navbar stays in the correct spot*/}
      <Box width="full" position="relative" p="0" m="0" color="gray.800">
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
    </Box>
  );
}