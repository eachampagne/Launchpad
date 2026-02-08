import { useState, useEffect, useContext } from 'react';
import { Link } from "react-router";
import axios from 'axios';

import { UserContext } from './UserContext';
import NavBar from "./NavBar";

import WidgetFrame from './WidgetFrame';
import Calendar from './Calendar';
import Email from './Email';
import Timer from './Timer';
import type { ThemeObject } from '../types/Calendar';
import { Box } from '@chakra-ui/react';

function Dashboard () {
  const { activeDash: dashboardId } = useContext(UserContext);

  const [dashboard, setDashboard] = useState({name: "Loading"});
  const [themeId, setThemeId] = useState(-1)
  const [themeObject, setThemeObject] = useState({} as ThemeObject)
  console.log(dashboard, 'dashboard')
  console.log(themeObject, 'should be the whole theme object')
  const loadDashboard = async () => {
    try {
      const response = await axios.get(`/dashboard/${dashboardId}`);
      setDashboard(response.data);
      setThemeId(response.data.themeId)
    } catch (error) {
      console.error('Failed to get dashboard:', error);
    }
  };

  // find the theme that matches the theme id stuff
  const settingTheme = async () => {
    try {
      const currentTheme = await axios.get(`/theme/theme/${themeId}`)
      console.log(currentTheme, 'currentTheme')
      if(!currentTheme){
        console.error('could not get theme')
      }
      setThemeObject(currentTheme.data)
    } catch (error) {
      console.error('Failed to get theme:', error);
    }
  }

  useEffect(() => {
    settingTheme()
  }, [themeId])

  useEffect(() => {
    loadDashboard();
  }, [dashboardId]);

  return (
    <Box bg={themeObject.bgColor} minH='100vh' w='100%'>
      <NavBar pages={["Home", "Hub"]} color={themeObject.navColor}/>
      <h2>{dashboard.name}</h2>
      <Link to='/edit'>Edit</Link>
      <WidgetFrame
        posX={1}
        posY={1}
        sizeX={5}
        sizeY={5}
        minWidth={2}
        minHeight={3}
        resizeActive={true}
        handleResize={(posX, posY, width, height) => console.log(`Now ${width}x${height} with top left corner at (${posX}, ${posY})`)}
        snapSize={100}
        color={themeObject.font}
      >
        <Calendar />
      </WidgetFrame>
      <WidgetFrame
        posX={7}
        posY={1}
        sizeX={5}
        sizeY={5}
        minWidth={1}
        minHeight={1}
        resizeActive={true}
        snapSize={100}
        color={themeObject.font}
      >
        <Email/>
      </WidgetFrame>
      <WidgetFrame
        posX={1}
        posY={7}
        sizeX={3}
        sizeY={2}
        minWidth={3}
        minHeight={2}
        resizeActive={false}
        snapSize={100}
        color={themeObject.font}
      >
        <Timer/>
      </WidgetFrame>
    </Box>
  );
}

export default Dashboard;
