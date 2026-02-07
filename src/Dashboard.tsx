import { useState, useEffect, useContext } from 'react';
import { Link } from "react-router";
import axios from 'axios';

import { UserContext } from './UserContext';
import NavBar from "./NavBar";

import WidgetFrame from './WidgetFrame';
import Calendar from './Calendar';
import Email from './Email';
import Timer from './Timer';

function Dashboard () {
  const { activeDash: dashboardId } = useContext(UserContext);

  const [dashboard, setDashboard] = useState({name: "Loading"});
  const loadDashboard = async () => {
    try {
      const response = await axios.get(`/dashboard/${dashboardId}`);
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to get dashboard:', error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [dashboardId]);

  return (
    <>
      <NavBar pages={["Home", "Hub"]} />
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
      >
        <Timer/>
      </WidgetFrame>
    </>
  );
}

export default Dashboard;
