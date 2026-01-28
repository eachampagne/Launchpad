import { useState, useEffect } from "react";
import axios from "axios";
// import { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router";

import Hub from "./Hub";
import Dashboard from './Dashboard';
import DashEditor from './DashEditor';
import Calendar from './Calendar';

function App() {
  const [userId, setUserId] = useState(2);
  const [userDataMessage, setUserDataMessage] = useState(
    "You have not checked User Data.",
  );
  const [dashboards, setDashboards] = useState([]);
  const activeDash = 1; // hardcoded for now
  // eventually want something like:
  // const [activeDash, setActiveDash] = useState(null)
  // what happens if the user doesn't have any dashboards?

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
      setUserDataMessage(res.data);
      console.log(res.data.id)
      setUserId(res.data.id)
    }).catch((err) => {
      console.error("There was a problem while getting user data", err);
    })
  }


  useEffect(() => {
    if (userId === -1) return; // TODO come back to update this once established
console.log(userId)
    const getDashboardsData = async () => {
      try {
        const res = await axios.get(`/dashboard/all/${userId}`);
        setDashboards(res.data);
      } catch (err) {
        console.error("There was a problem while getting user dashboards", err);
      }
    };

    getDashboardsData();
  }, [userId]);


  return (
    <>
      <h1>Rendering</h1>
      <h1>Sign in</h1>
      <a className="button google" href="/login/federated/google">Sign in with Google</a>
      <button className="logout button google" onClick={() => {handleLogOut()}}>Log Out</button>
      <button className="testGetUserData" onClick={() => {getUserData()}}>Get User Data</button>
      <p>{userDataMessage}</p>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Dashboard dashboardId={activeDash}/>} />
          <Route path='/edit' element={<DashEditor dashboardId={activeDash} ownerId={userId} />} />
          <Route path="/hub" element={<Hub dashboards={dashboards}/>} />
        </Routes>
        </BrowserRouter>
      <Calendar />
    </>
  );
}

export default App;
