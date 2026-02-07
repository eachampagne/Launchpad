import { createContext, useState, useEffect } from 'react';

import axios from 'axios';

type ClientUser = {
  id: number,
  name?: string,
  primaryDashId: number | null
}

export const UserContext = createContext({
  user: {id: -1, primaryDashId: null} as ClientUser,
  activeDash: -1,
  handleLogout: () => {},
  setActiveDash: (n: number) => {},
  getPrimaryDash: () => {}
});

function UserProvider ({children}: {children?: React.ReactNode}) {
  const [user, setUser] = useState({id: -1} as ClientUser);
  const [activeDash, setActiveDash] = useState(-1);

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      getUser();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  const getUser = async () => {
    try {
      const response = await axios.get('/user');
      if (response.data.id) {
        setUser(response.data as ClientUser);
      } else {
        setUser({id: -1} as ClientUser);
      }
    } catch (error) {
      console.error('Failed to get user:', error);
    }
  };

  const getPrimaryDash = async () => {
    try {
      const response = await axios.get(`/dashboard/primary/${user.id}`);
      // update only the primaryDashId property
      // this might trigger rerenders of anything that depends on id anyway...
      setUser(u => {
        return {
          ...u,
          primaryDashId: response.data
        }
      });
    } catch (error) {
      console.error('Failed to get user\'s primary dash:', error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <UserContext value={{
      user,
      activeDash,
      handleLogout,
      setActiveDash,
      getPrimaryDash
    }}>
      {children}
    </UserContext>
  );
}

export default UserProvider;
