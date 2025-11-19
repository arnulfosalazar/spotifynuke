require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Login route
app.get('/login', (req, res) => {
  const scope = 'playlist-read-private playlist-modify-private playlist-modify-public';
  const authUrl =
    'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: scope
    }).toString();

  res.redirect(authUrl);
});

// Callback route
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  const tokenResponse = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const accessToken = tokenResponse.data.access_token;

  // Fetch playlists
  const playlists = await axios.get('https://api.spotify.com/v1/me/playlists', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  res.send(playlists.data.items.map(p => p.name));
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Spotify Nuke Tool</h1>
    <a href="/login">Click here to login with Spotify</a>
  `);
});


app.listen(8888, () => console.log('Server running on http://127.0.0.1:8888'));
