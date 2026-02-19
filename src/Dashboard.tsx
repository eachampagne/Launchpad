import { useState, useEffect, useContext } from 'react';
import { Link } from "react-router";
import type { ThemeObject } from '../types/Calendar';
import { Box } from '@chakra-ui/react';
import { UserContext } from './UserContext';
import LayoutCanvas from './LayoutCanvas'
import NavBar from "./NavBar";
import axios from 'axios';
import changeTextColor from './utilities/color.ts'



type Layout = {
  id: number;
  gridSize: string;
  layoutElements: LayoutElement[];
};

type LayoutElement = {
  id: number;
  posX: number;
  posY: number;
  sizeX: number;
  sizeY: number;
  widget: {
    name: string
  }
};

type Dashboard = {
  id: number;
  name: string;
  layout: Layout
};


function Dashboard () {
  const { activeDash: dashboardId } = useContext(UserContext);

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
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

  // for the text color
  const textColor = changeTextColor(themeObject.bgColor)


  useEffect(() => {
    settingTheme()
  }, [themeId])

  useEffect(() => {
    loadDashboard();
  }, [dashboardId]);

    if (!dashboard) {
    console.log("No dashboard")
    return <div>
      Loading
    </div>;
  }

  return (
    <Box bg={themeObject.bgColor} color={textColor} minH='100vh' w='100%'>
      <NavBar pages={["Home", "Hub"]} textColor={textColor} navColor={themeObject.navColor}/>
      <h2>{dashboard.name}</h2>
      <Link to='/edit'>Edit</Link>
      <LayoutCanvas
      layout={dashboard.layout}
      editable={false}>
      </LayoutCanvas>

    </Box>
  );
}

export default Dashboard;
