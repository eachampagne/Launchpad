import { useState, useEffect } from 'react';
import { Link } from "react-router";
import axios from 'axios';

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
    </>
  );
}

export default Dashboard;
