import express from 'express';
import request from 'request';
import { prisma } from '../database/prisma.js';

const spotify = express.Router();

const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;

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
    redirect_uri: 'http://127.0.0.1:8000/spotify/callback',
    state: state,
  });

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
});

spotify.get('/callback', (req, res) => {
  const code = req.query.code;

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: 'http://127.0.0.1:8000/spotify/callback',
      grant_type: 'authorization_code',
    },
    headers: {
      'Authorization': 'Basic ' + Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    json: true,
  };

  request.post(authOptions, function (error: any, response: any, body: any) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      res.redirect('/');
    }
  });
});

spotify.get('/token', (req, res) => {
  res.json({ access_token: access_token });
});

export default spotify;