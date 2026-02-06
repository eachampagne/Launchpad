import { useState, useEffect } from 'react';
import { Link } from "react-router";
import axios from 'axios';

import LayoutCanvas from './LayoutCanvas'



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

type Dash = {
  name: string;
  layout: Layout;
};



function Dashboard ({dashboardId}: {dashboardId: number}) {
  const [dashboard, setDashboard] = useState<Dash | null>(null);
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

    if (!dashboard) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h2>{dashboard.name}</h2>
      <Link to='/edit'>Edit</Link>
      <LayoutCanvas
      layout={dashboard.layout}>
      </LayoutCanvas>
    </>
  );
}

export default Dashboard;
