import { createContext, useState, useEffect } from 'react';

import axios from 'axios';

type ClientUser = {
  id: number,
  name?: string,
  primaryDashId?: number
}

export const UserContext = createContext({
  user: {id: -1} as ClientUser
});

function UserProvider ({children}: {children?: React.ReactNode}) {
  const [user, setUser] = useState({id: -1} as ClientUser);

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

  useEffect(() => {
    getUser();
  }, []);

  return (
    <UserContext value={{user}}>
      {children}
    </UserContext>
  );
}

export default UserProvider;
