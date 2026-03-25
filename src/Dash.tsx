import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AbsoluteCenter, Box, Container, IconButton, ScrollArea, Spinner } from "@chakra-ui/react";
import { LuCheck, LuPencil } from "react-icons/lu";

import NavBar from "./NavBar";
import LayoutCanvas from './LayoutCanvas';
import { UserContext } from './UserContext';

import changeTextColor from './utilities/color.ts'
import type { ThemeObject } from '../types/Calendar';
import type { Dashboard } from '../types/LayoutTypes';

export default function Dashboard () {
  const { activeDash } = useContext(UserContext);

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [themeId, setThemeId] = useState(-1);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [theme, setTheme] = useState({} as ThemeObject)

  const loadDashboard = async () => {
    // not a real dash
    if (activeDash === -1) {
      return;
    }

    try {
      setLoading(true)
      const response = await axios.get(`/dashboard/${activeDash}`);
      // originally, the /dashboard/:id route didn't include the theme data, so omit the theme from the dashboard state var
      const { theme, ...dashboard } = response.data;
      setDashboard(dashboard);
      setTheme(theme);
      setThemeId(dashboard.themeId);
      setLoading(false);
    } catch (error) {
      console.error('Failed to get dashboard:', error);
      setLoading(false);
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

  useEffect(() => {
    loadDashboard();
  }, [activeDash]);

  const renderEditButton = () => {
    return (
      <IconButton onClick={() => setEditMode(e => !e)} position="absolute" right="20px" top="20px">
        {editMode ? <LuCheck /> : <LuPencil />}
      </IconButton>
    );
  };


  // early return for loading state, guards against null dashboard
  if (!dashboard || loading) {
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
              <Container >
                <LayoutCanvas
                  layout={dashboard.layout}
                  editable={editMode}>
                </LayoutCanvas>
              </Container>
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