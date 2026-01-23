import { useState } from 'react';
import axios from 'axios';
// import { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router";

import Dashboard from './Dashboard';
import DashEditor from './DashEditor';

function App() {
  const [userDataMessage, setUserDataMessage] = useState('You have not checked User Data.');

  const activeDash = 1; // hardcoded for now
  // eventually want something like:
  // const [activeDash, setActiveDash] = useState(null)
  // what happens if the user doesn't have any dashboards?

  const handleLogOut = () => {
    axios.post('/logout').then((/* Response */) => {
      // We don't need to do anything with this yet.
    }).catch((err) => {
      console.error("There was a problem while logging out", err);
    })
  }

  const getUserData = () => {
    axios.get('/user').then((res) => {
      setUserDataMessage(res.data);
    }).catch((err) => {
      console.error("There was a problem while getting user data", err);
    })
  }

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
          <Route path='/edit' element={<DashEditor dashboardId={activeDash}/>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
