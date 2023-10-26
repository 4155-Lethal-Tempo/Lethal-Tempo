/* 
  Videos/sites being used that may help:
  Using Spotify API with JavaScript - https://medium.com/@awoldt/using-spotify-api-with-javascript-9dd839407f12
  Spotify API OAuth - https://www.youtube.com/watch?v=olY_2MW4Eik&t=1223s
  Learn Express JS in 35 minutes - https://www.youtube.com/watch?v=SccSCuHhOw0  
*/                

const express = require('express');
const app = express();
const querystring = require('node:querystring');
require('dotenv').config();
const port = 8084;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// This page contains a link that sends you to the Spotify login page
app.get('/', (req, res) => {
    res.render('index.ejs');
});

// When you click on said line you are sent to this
var state;
app.get('/login', (req, res) => {
    var state = generateRandomString(16);
    var scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-follow-read user-follow-modify user-top-read user-read-recently-played user-read-playback-position';

    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI,
      state: state
    }));
});

// This is the callback page that is called after you login
// It is supposed to give you an access token and a refresh token
// We'll use this to make API calls
var code;
app.get('/callback', async (req, res) => {
    code = req.query.code || null;
    var state = req.query.state || null;
  
    if (state === null) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: process.env.REDIRECT_URI,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'))
        },
        json: true
      };
    }
    console.log(authOptions);
    res.redirect('/home');
});

app.get('/home', (req, res) => {
    res.render('main/landingPage.ejs');
});
app.get('/topTracks', (req, res) => {
  res.render('main/topTracks.ejs');
});

var access_token;
// Refreshes the access token in case it expires
app.get('/refresh_token', function(req, res) {

    var refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };
  
    
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        access_token = body.access_token;
        res.send({
          'access_token': access_token
        });
      }
    });
});

// Generates a random string containing numbers and letters - used for state
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }

    return result;
}


if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

localStorage.setItem('myFirstKey', 'myFirstValue');
console.log(localStorage.getItem('myFirstKey'));
const fetch = require('node-fetch');

app.get('/top-tracks', async (req, res) => {
  res.redirect('/topTracks');
  //localStorage.getItem('access_token')
  let accessToken = 'BQBu7ZkdKaKhZP6mEeLK4FZ71mTBB7eUIdGk2dmbRyqHBuYARw5gpaahn6GvevKjTUC6zyT4GMp1_G1ubL2S-HRQfRqy11dxuNSgqGMHyb1efIiKKaQcgGwL_erNzK2xs38wVYnVRFgEYLW2E9Y9HPh-xkEb7bZIIO1fDkYIc4DhTuW8rwgCW0vvzto3K3YUUB1mQGaAWv9QR0-ApE1Z7rpqnz3r443Vuvf1a3TMA6bBUivF_0uwNlvC_hiu856O1nYNkZAt';
  const token = accessToken;
  async function fetchWebApi(endpoint, method, body) {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method,
      body:JSON.stringify(body)
    });
    return await res.json();
  }
  
  //long term(all time) most listened to songs
  async function getTopTracksLong(){
    return (await fetchWebApi(
      'v1/me/top/tracks?time_range=long_term&limit=25', 'GET'
    )).items;
  }
  
  const topTracksLong = await getTopTracksLong();
  console.log(
    topTracksLong?.map(
      ({name, artists}) =>
        `${name} by ${artists.map(artist => artist.name).join(', ')}`
    )
  );

  //medium term(6 months) most listened to songs
  async function getTopTracksMedium(){
    return (await fetchWebApi(
      'v1/me/top/tracks?time_range=medium_term&limit=25', 'GET'
    )).items;
  }
  
  const topTracksMedium = await getTopTracksMedium();
  console.log(
    topTracksMedium?.map(
      ({name, artists}) =>
        `${name} by ${artists.map(artist => artist.name).join(', ')}`
    )
  );

  //short term(30 days) most listened to songs
  async function getTopTracksShort(){
    return (await fetchWebApi(
      'v1/me/top/tracks?time_range=short_term&limit=25', 'GET'
    )).items;
  }
  
  const topTracksShort = await getTopTracksShort();
  console.log(
    topTracksShort?.map(
      ({name, artists}) =>
        `${name} by ${artists.map(artist => artist.name).join(', ')}`
    )
  );

  });
