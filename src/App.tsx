import { useState } from 'react';
import axios from 'axios';

import Dashboard from './Dashboard';
import DashEditor from './DashEditor';

function App() {
  const [editing, setEditing] = useState(false);
  const [userDataMessage, setUserDataMessage] = useState('You have not checked User Data.');

  const toggleEditing = () => {
    setEditing((e: boolean) => !e);
  }

  const dashboardId = 1; // hardcoded for now

  const handleLogOut = () => {
    console.log("log out test");
    axios.post('/logout').then((res) => {
      console.log(res);
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
      {
        editing ? <DashEditor dashboardId={dashboardId} toggleEditing={toggleEditing}/>
          : <Dashboard dashboardId={dashboardId} toggleEditing={toggleEditing}/>
      }
      <h1>Sign in</h1>
      <a className="button google" href="/login/federated/google">Sign in with Google</a>
      <button className="logout button google" onClick={() => {handleLogOut()}}>Log Out</button>
      <button className="testGetUserData" onClick={() => {getUserData()}}>Get User Data</button>
      <p>{userDataMessage}</p>
    </>
  );
}

export default App;
