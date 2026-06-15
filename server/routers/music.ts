import express from 'express';
import axios from 'axios';
import { prisma } from '../database/prisma.js';

const spotify = express.Router();

const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const spotify_redirect = process.env.SPOTIFY_LOGIN_REDIRECT_URL;

let access_token = '';

const generateRandomString = function (length: number) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

spotify.get('/login', (req, res) => {
  const scope = 'streaming user-read-email user-read-private';
  const state = generateRandomString(16);

  const auth_query_parameters = new URLSearchParams({
    response_type: 'code',
    client_id: spotify_client_id!,
    scope: scope,
    redirect_uri: spotify_redirect!,
    state: state,
  });

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
});

spotify.get('/callback', async (req, res) => {
  const code = req.query.code;

  const body = {
    code: code,
    redirect_uri: spotify_redirect!,
    grant_type: 'authorization_code',
  };

  const config = {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  try {
    const spotifyResponse = await axios.post('https://accounts.spotify.com/api/token', body, config);
    if (spotifyResponse.status === 200) {
      access_token = spotifyResponse.data.access_token;
      res.redirect('/');
    } else {
      console.error('Unexpected status code from Spotify API:', spotifyResponse.status);
      res.sendStatus(500);
    }
  } catch (error) {
    console.error('Problem accessing the Spotify API:', error);
    res.sendStatus(500);
  }
});

spotify.get('/token', (req, res) => {
  res.json({ access_token: access_token });
});

export default spotify;