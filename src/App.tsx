import { useState, useEffect, useCallback } from "react";
import axios from "axios";
// import { useState } from 'react';
// import axios from 'axios';
import { BrowserRouter, Routes, Route } from "react-router";

import Hub from "./Hub";
import Dashboard from './Dashboard';
import DashEditor from './DashEditor';
import Home from './Home';

import Calendar from './Calendar';

function App() {
  const [userId, setUserId] = useState(2); // hardcoded user id state for now for testing purposes
  const [userDataMessage, setUserDataMessage] = useState(
    "You have not checked User Data.",
  );
  const [dashboards, setDashboards] = useState([]);
  const activeDash = 1; // hardcoded for now
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

  const getDashboardsData = useCallback(async () => {
    
    try {
      const res = await axios.get(`/dashboard/all/${userId}`);
      setDashboards(res.data);
    } catch (err) {
      console.error("There was a problem while getting user dashboards", err);
    }
  }, [userId]);
  
  useEffect(() => {
    if (userId === -1) return; // TODO come back to update this once established

    (async () => {
      getDashboardsData();
    })();
  }, [userId, getDashboardsData]);


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home getUserData={getUserData} handleLogOut={handleLogOut} userId={userId} />} />
          <Route path='/dashboard' element={<Dashboard dashboardId={activeDash}/>} />
          <Route path='/edit' element={<DashEditor dashboardId={activeDash} ownerId={userId} />} />
          <Route path="/hub" element={<Hub dashboards={dashboards} getDashboardData={getDashboardsData} ownerId={userId}/>} />
        </Routes>
        </BrowserRouter>
      {/* <Calendar /> */}
    </>
  );
}

export default App;
