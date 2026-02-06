import { useState, useEffect, useCallback } from "react";
import axios from "axios";
// import { useState } from 'react';
// import axios from 'axios';
import { BrowserRouter, Routes, Route } from "react-router";

import UserProvider from './UserContext';

import Hub from "./Hub";
import Dashboard from './Dashboard';
import DashEditor from './DashEditor';
import Home from './Home';

function App() {
  const [userId, setUserId] = useState(1); // hardcoded user id state for now for testing purposes
  const [userDataMessage, setUserDataMessage] = useState(
    "You have not checked User Data.",
  );
  const [dashboards, setDashboards] = useState([]);
  const [primaryDashId, setPrimaryDashId] = useState(-1)
  const [schedules, setSchedules] = useState([]);
  const [activeDash, setActiveDash] = useState(-1) // TODO
  console.log(activeDash)
  // eventually want something like:
  // const [activeDash, setActiveDash] = useState(null)
  // ? what happens if the user doesn't have any dashboards?
  
  const handleLogOut = () => {
    axios
      .post("/logout")
      .then((/* Response */) => {
        // We don't need to do anything with this yet.
      })
      .catch((err) => {
        console.error("There was a problem while logging out", err);
      });
  };

  const getUserData = () => {
    axios.get('/user').then((res) => {
      if (res.data.id) { // not sure about this
        // setUserDataMessage(res.data);
        console.log(res.data.id)
        setUserId(res.data.id)
      } else {
        // setUserDataMessage({name: 'Not logged in.'}); commented out for now, causing me an error
        setUserId(-1);
      }
    }).catch((err) => {
      console.error("There was a problem while getting user data", err);
    })
  }

  // handles selecting a dashboard to view
  const handleDashboardSelection = (dashboardId: number) => {
    setActiveDash(dashboardId);
  }

  // handles primaryDash selection changes
  const handlePrimaryChange = (dashboardId: number) => {
    setPrimaryDashId(dashboardId)
  }

  const getPrimaryDash = useCallback(async () => {

    try {
      const res = await axios.get(`/dashboard/primary/${userId}`);
      setPrimaryDashId(res.data)
    } catch (error) {
      console.error("There was a problem while getting user's primary dashboard", error)
    }
  }, [userId])

  // get user's primary dashboard on initial render
  useEffect(() => {
    (async () => {
      getPrimaryDash()
    })();
  }, [getPrimaryDash])

  /**
   * Used to get current dashboard data from database
   */
  const getDashboardsData = useCallback(async () => {
    
    try {
      const res = await axios.get(`/dashboard/all/${userId}`);
      setDashboards(res.data);
    } catch (error) {
      console.error("There was a problem getting user's dashboards", error);
    }
  }, [userId]);

  // get dashboard data on initial render
  useEffect(() => {
    if (userId === -1) return; // TODO come back to update this once established

    (async () => {
      getDashboardsData();
    })();
  }, [userId, getDashboardsData]);

  const getScheduledDashboardsData = useCallback(async () => {

    try {
      const res = await axios.get(`/schedule/${userId}`)
      setSchedules(res.data)
    } catch (error) {
      console.error("There was a problem getting user's scheduled dashboards", error);
    }
  }, [userId])

  // retrieve scheduled dashboards on initial render
  useEffect(() => {
    (async () => {
      getScheduledDashboardsData();
    })();
  }, [getScheduledDashboardsData]);


  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home getUserData={getUserData} handleLogOut={handleLogOut} userId={userId} />} />
          <Route path='/dashboard' element={<Dashboard dashboardId={activeDash}/>} />
          <Route path='/edit' element={<DashEditor dashboardId={activeDash} ownerId={userId} />} />
          <Route path="/hub" element={<Hub dashboards={dashboards} schedules={schedules} getDashboardData={getDashboardsData} refreshPrimaryDash={getPrimaryDash} handlePrimaryChange={handlePrimaryChange} handleDashboardSelection={handleDashboardSelection} ownerId={userId} primaryDashId={primaryDashId} activeDash={activeDash}/>} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
