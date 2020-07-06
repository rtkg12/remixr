require('dotenv').config({ path: `${__dirname}/app.env` });

const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const cookieParser = require('cookie-parser');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cookieParser());

const scopes = ['user-read-private', 'user-read-email', 'playlist-read-private', 'user-top-read', 'playlist-modify-public'];
const redirectUri = process.env.REDIRECT_URI;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const spotifyApi = new SpotifyWebApi({
  redirectUri,
  clientId,
  clientSecret,
});

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

async function login() {
  const state = generateRandomString(30);
  // eslint-disable-next-line no-unused-vars
  const authorizeURL = await spotifyApi.createAuthorizeURL(scopes, state);

  return { authorizeURL, state };
}

function isLoggedIn(req, res, next) {
  if (req.cookies.access_token && req.cookies.refresh_token) {
    if (Date.now() < req.cookies.expiry_time) {
      next();
    } else {
      res.redirect('/refresh');
    }
  } else {
    res.redirect('/login');
  }
}

async function refreshToken(refresh_token) {
  const spotifyApi = new SpotifyWebApi({
    redirectUri,
    clientId,
    clientSecret,
  });
  spotifyApi.setRefreshToken(refresh_token);

  return await spotifyApi.refreshAccessToken();
}

/**
 * Returns an instance of logged in spotify using the credentials
 * @param {*} access_token
 * @param {*} refresh_token
 */
function createLoggedInUser(req, res) {
  return new Promise((resolve, reject) => {
    let loggedInSpotify;

    loggedInSpotify = new SpotifyWebApi({
      redirectUri,
      clientId,
      clientSecret,
    });
    loggedInSpotify.setAccessToken(req.cookies.access_token);
    loggedInSpotify.setRefreshToken(req.cookies.refresh_token);

    resolve(loggedInSpotify);
  });
}

function getUserId(loggedInSpotify) {
  return new Promise((resolve, reject) => {
    loggedInSpotify.getMe().then(userData => {
      resolve(userData.body.id);
    });
  });
}

async function createAPI() {
  const spotify = new SpotifyWebApi({
    redirectUri,
    clientId,
    clientSecret,
  });
  const data = await spotify.clientCredentialsGrant();
  spotify.setAccessToken(data.body.access_token);
  return spotify;
}

module.exports = {
  isLoggedIn,
  refreshToken,
  createLoggedInUser,
  getUserId,
  login,
  spotifyApi,
  createAPI
};
