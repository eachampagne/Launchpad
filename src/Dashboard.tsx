import { useState, useEffect } from 'react';
import { Link } from "react-router";
import axios from 'axios';

import WidgetFrame from './WidgetFrame';
import Calendar from './Calendar';
import Email from './Email';

function Dashboard ({dashboardId}: {dashboardId: number}) {
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
  }, []);

  return (
    <>
      <h2>{dashboard.name}</h2>
      <Link to='/edit'>Edit</Link>
      <WidgetFrame
        x1={1}
        y1={1}
        x2={6}
        y2={6}
        minWidth={1}
        minHeight={1}
        snapSize={100}
      >
        <Calendar />
      </WidgetFrame>
      <WidgetFrame
        x1={7}
        y1={1}
        x2={12}
        y2={6}
        minWidth={1}
        minHeight={1}
        snapSize={100}
      >
        <Email/>
      </WidgetFrame>
    </>
  );
}

export default Dashboard;
