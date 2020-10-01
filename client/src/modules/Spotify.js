const SpotifyWebApi = require('spotify-web-api-node');
const axios = require('axios');

const DEFAULT_ARTIST_IMAGE = '/images/artist.png';
const DEFAULT_TRACK_IMAGE = '/images/track.png';
const URI = process.env.REACT_APP_API_URL;

const authenticate = (accessToken) => {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);
  return spotifyApi;
};

const search = async (accessToken, searchTerm) => {
  let types = ['track', 'artist', 'playlist'];
  let limit = 3;
  let response;

  if (accessToken) {
    // Logged in
    const spotifyApi = authenticate(accessToken);
    response = await spotifyApi.search(searchTerm, types, { limit });
  } else {
    response = await axios.get(`${URI}/search`, {
      params: { searchTerm, types, limit },
    });
    response = response.data;
  }

  return {
    artists: response.body.artists.items,
    tracks: response.body.tracks.items,
    playlists: response.body.playlists.items,
  };
};

const getRecommendations = async (accessToken, parameters, seeds, limit) => {
  let response;

  if (accessToken) {
    const spotify = authenticate(accessToken);

    let params = {};
    params.seed_artists = seeds.artists.map((artist) => artist.id);
    params.seed_tracks = seeds.tracks.map((track) => track.id);

    const relevant_features = ['danceability', 'energy', 'acousticness', 'valence', 'tempo', 'popularity'];

    for (let feature of relevant_features) {
      params[`min_${feature}`] = parameters[feature].min;
      params[`max_${feature}`] = parameters[feature].max;
    }

    params.limit = limit;

    response = await spotify.getRecommendations(params);
  } else {
    response = await axios.post(`${URI}/recommendations`, {
      parameters,
      seeds,
      limit,
    });
    response = response.data;
  }

  return response.body.tracks;
};

/**
 * Extracts artist name, id and image from the HTTP artist object
 * @param artist
 * @returns {{image: (*), name: *, id: *}}
 */
const extractArtistInfo = (artist) => ({
  name: artist.name,
  id: artist.id,
  image: artist.images && artist.images.length > 0 ? artist.images[artist.images.length - 1].url : DEFAULT_ARTIST_IMAGE,
});

/**
 * Extracts track name, id and image from the HTTP track object
 * @param track
 * @returns {{image: (*), name: *, id: *}}
 */
const extractTrackInfo = (track) => ({
  name: track.name,
  id: track.id,
  image:
    track.album && track.album.images && track.album.images.length > 0
      ? track.album.images[track.album.images.length - 1].url
      : DEFAULT_TRACK_IMAGE,
});

const getArtists = async (accessToken, artistIds) => {
  let response;

  if (accessToken) {
    const spotify = authenticate(accessToken);
    response = await spotify.getArtists(artistIds);
  } else {
    response = await axios.get(`${URI}/artists`, {
      params: { artistIds },
    });
    response = response.data;
  }

  return response.body.artists.map(extractArtistInfo);
};

const getTracks = async (accessToken, trackIds) => {
  let response;

  if (accessToken) {
    const spotify = authenticate(accessToken);
    response = await spotify.getTracks(trackIds);
  } else {
    response = await axios.get(`${URI}/tracks`, {
      params: { trackIds },
    });
    response = response.data;
  }

  return response.body.tracks.map(extractTrackInfo);
};

const checkContainTrack = async (accessToken, trackIds) => {
  let response;
  if (accessToken) {
    const spotify = authenticate(accessToken);
    response = await spotify.containsMySavedTracks(trackIds);
  } 
  return response;
};

const addToMySavedTracks = async (accessToken,trackIds) => {
  let response;
  if (accessToken) {
    const spotify = authenticate(accessToken);
    response = await spotify.addToMySavedTracks(trackIds);
    return response;
  } 
};

const removeFromMySavedTracks = async (accessToken,trackIds) => {
  let response;
  if (accessToken) {
    const spotify = authenticate(accessToken);
    response = await spotify.removeFromMySavedTracks(trackIds);
    return response;
  } 
};

const getMySavedTracks = async (accessToken,trackIds) => {
  let response;
  if (accessToken) {
    const spotify = authenticate(accessToken);
    response = await spotify.getMySavedTracks(trackIds);
    return response;
  } 
};

export { authenticate, search, getRecommendations, extractArtistInfo, extractTrackInfo, getArtists, getTracks, checkContainTrack, addToMySavedTracks, removeFromMySavedTracks, getMySavedTracks };
