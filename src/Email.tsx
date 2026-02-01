import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

import { AuthStatus } from '../types/WidgetStatus.ts';

function Email () {
  const [authStatus, setAuthStatus] = useState(AuthStatus.SignedOut);
  const [emails, setEmails] = useState([] as {id: string, snippet: string}[]);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/checkauth/gmail');
      if (response.data === true) {
        setAuthStatus(AuthStatus.Authorized);
        getEmails();
      } else if (response.data === false) {
        setAuthStatus(AuthStatus.Unauthorized);
      } else {
        console.error('Unexpected response from auth check: expected true or false, got', response.data);
      }
    } catch (error) {
      if ((error as AxiosError).status === 401) {
        setAuthStatus(AuthStatus.SignedOut);
      } else {
        console.error('Failed to check auth status:', error);
      }
    }
  };

  const getEmails = async () => {
    try {
      const response = await axios.get('/email');
      setEmails(response.data);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    }
  };

  const renderEmails = () => {
    switch(authStatus) {
      case AuthStatus.Authorized:
        if (emails.length === 0) {
          return <p>No emails to show.</p>;
        } else {
          return (
            emails.map(email => {
              return <p>{email.snippet}</p>;
            })
          );
        }
        break;
      case AuthStatus.Unauthorized:
        return <a href='/auth/gmail'>Authorize Gmail</a>
        break;
      case AuthStatus.SignedOut:
        return <p>Please sign in.</p>;
        break;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div>
      <h6>Email</h6>
      {renderEmails()}
    </div>
  );
}

export default Email;