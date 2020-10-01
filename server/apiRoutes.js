const express = require('express');

const router = express.Router();

const user = require('./modules/user');
const playlist = require('./modules/playlist');
const stats = require('./modules/processStats');

const ENV = process.env.NODE_ENV;
const isProduction = ENV === 'production';

router.get('/login', async function(req, res) {
  user.login().then(ret => {
    res.cookie('stateKey', ret.state);

    // Where to redirect after login. Default expiry time of 3 minutes
    req.query.redirectTo &&
      res.cookie('redirectTo', req.query.redirectTo, {
        maxAge: 3 * 60 * 1000,
      });

    const authorizeURL = `${ret.authorizeURL}&show_dialog=true`;
    res.redirect(authorizeURL);
  });
});

router.get('/callback', async function(req, res) {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies.stateKey : null;
  const clientURL = process.env.CLIENT_URL;
  const redirectTo = req.cookies.redirectTo || "";

  try {
    if (state === null || state !== storedState || code == null) {
      // eslint-disable-next-line no-console
      throw "Authentication error: State invalid";
    }
    res.clearCookie('stateKey');
    res.clearCookie('redirectTo');

    let data = await user.spotifyApi.authorizationCodeGrant(code);

    // 95 to prevent access token expiring early because of delays in this request
    const tokenSecurityData = {
      domain: '.remixr.xyz',
      secure: true,
      sameSite: true,
    };
    const accessTokenMaxAge = {
      maxAge: data.body.expires_in * 0.95 * 1000,
    };

    res.cookie('access_token', data.body.access_token, isProduction ? {...tokenSecurityData, ...accessTokenMaxAge} : accessTokenMaxAge);
    res.cookie('refresh_token', data.body.refresh_token, isProduction ? tokenSecurityData : {});

    let userID = await user.getUserId(data.body.access_token);
    res.cookie('userID', userID);
  } catch (e) {
    console.log(e);
  } finally {
    res.redirect(`${clientURL}/${redirectTo}`);
  }

});

router.get('/refresh', async (req, res) => {
  try {
    let data = await user.refreshToken(req.cookies.refresh_token);
    res.json({
      access_token: data.body.access_token,
      maxAge: data.body.expires_in * 0.95 * 1000
    });
  } catch (e) {
    console.log("Error while refreshing token");
    console.log(e);
  }
});

router.get('/playlists', async (req, res) => {
  try {
    let allUserPlaylists = await playlist.loadPlaylists(req);
    res.json({ playlists: allUserPlaylists });
  } catch (e) {
    console.log(e);
    res.status(500).send("Server error");
  }
});

router.get('/results/:id', async (req, res) => {
  try {
    const playlistId = req.params.id;
    console.log(`Playlist ID: ${playlistId}`);

    const isLoggedIn = req.cookies.access_token !== undefined && req.cookies.access_token !== null && req.cookies.access_token !== "";

    let loggedInSpotify = isLoggedIn ? await user.createLoggedInUser(req, res) : await user.createAPI();

    const {parameters, tracks, artists} = await stats.calculateStats(loggedInSpotify, playlistId, isLoggedIn);

    console.log(parameters);
    const songs = await playlist.getRecommendations(loggedInSpotify, parameters);
    res.json({ songs, parameters });
  } catch (e) {
    console.log(e);
    res.status(500).send("Server error");
  }
});

router.post('/recommendations', async (req, res) => {
  try {
    // Parse parameters from request
    let parameters = {}
    parameters.seed_artists = req.body.seeds.artists.map((artist) => artist.id);
    parameters.seed_tracks = req.body.seeds.tracks.map((track) => track.id);

    const relevant_features = [
      'danceability',
      'energy',
      'acousticness',
      'valence',
      'tempo',
      'popularity',
    ];

    for(let feature of relevant_features) {
      parameters[`min_${feature}`] = req.body.parameters[feature].min;
      parameters[`max_${feature}`] = req.body.parameters[feature].max;
    }

    parameters.limit = req.body.limit;

    const spotify = await user.createAPI();
    const results = await spotify.getRecommendations(parameters);
    res.json({body: results.body});
  } catch (e) {
    console.log(e);
    res.status(500).send("Server error");
  }
});

router.post('/save', async (req, res) => {
  try {
    let {name, tracks} = req.body;
    const loggedInSpotify = await user.createLoggedInUser(req, res);
    let link = await playlist.createNewPlaylist(loggedInSpotify, name, tracks);
    res.status(200).json({link});
  } catch (e) {
    console.log(e);
    res.status(500).send("Server error");
  }
});

router.get('/search', async (req, res) => {
  try {
    const spotify = await user.createAPI();
    const { searchTerm, types, limit } = req.query;
    const results =  await spotify.search(searchTerm, types, {limit});
    res.json({body: results.body});
  } catch (e) {
    console.log(e);
  }
});

router.get('/artists', async (req, res) => {
  try {
    const spotify = await user.createAPI();
    const { artistIds } = req.query;
    const results =  await spotify.getArtists(artistIds);
    res.json({body: results.body});
  } catch (e) {
    console.log(e);
  }
});

router.get('/tracks', async (req, res) => {
  try {
    const spotify = await user.createAPI();
    const { trackIds } = req.query;
    const results =  await spotify.getTracks(trackIds);
    res.json({body: results.body});
  } catch (e) {
    console.log(e);
  }
});

module.exports = router
