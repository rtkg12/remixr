const stats = require('simple-statistics');
const User = require('./user');
const Playlist = require('./playlist');

async function calculateStats(loggedInSpotify, playlistId) {
  let tracks = await Playlist.getPlaylistTracks(loggedInSpotify, playlistId);
  tracks = tracks.filter(item => item.track != null)

  let artists = await Playlist.getListOfArtistsFromTracks(tracks);
  const promiseArray = [];

  promiseArray.push(Playlist.extractTrackFeatures(loggedInSpotify, tracks));
  promiseArray.push(Playlist.getArtistRankRecommendations(loggedInSpotify, tracks, 2));
  promiseArray.push(Playlist.getTrackRankRecommendations(loggedInSpotify, tracks, 3));

  let output = await Promise.all(promiseArray);
  const parameters = calculateFeatureParameters(output[0]);
  const seed_artists = output[1];
  const seed_tracks = output[2];

  let options = buildRecommendationOptions(parameters, seed_artists, seed_tracks);
  return {parameters: options, tracks, artists};
}

function calculateFeatureParameters(audioFeatures) {
  const parameters = {};

  // List of audio features
  const features = [
    'danceability',
    'energy',
    'key',
    'loudness',
    'mode',
    'speechiness',
    'acousticness',
    'instrumentalness',
    'liveness',
    'valence',
    'tempo',
    'popularity',
  ];

  features.forEach(feature => {
    const mean = parseFloat(stats.mean(audioFeatures[feature]).toFixed(2));
    const min = parseFloat(stats.quantile(audioFeatures[feature], 0.1).toFixed(2));
    const max = parseFloat(stats.quantile(audioFeatures[feature], 0.9).toFixed(2));
    parameters[feature] = { mean, min, max };
  });
  return parameters;
}

function getRecommendations(loggedInSpotify) {
  return new Promise((resolve, reject) => {
    loggedInSpotify.getRecommendations();
  });
}

function buildRecommendationOptions(parameters, seed_artists, seed_tracks) {
  const relevant_features = [
    'danceability',
    'energy',
    'acousticness',
    'valence',
    'tempo',
    'popularity',
  ];

  const options = {};

  for (let feature of relevant_features) {
    if (feature === "popularity") {
      options[`min_${feature}`] = Math.round(parameters[feature].min)
      options[`max_${feature}`] = Math.round(parameters[feature].max);
      // options[`target_${relevant_features[i]}`] = parameters[relevant_features[i]].mean;
    } else {
      options[`min_${feature}`] = parameters[feature].min;
      options[`max_${feature}`] = parameters[feature].max;
      // options[`target_${relevant_features[i]}`] = parameters[relevant_features[i]].mean;
    }
  }
  options.seed_artists = seed_artists;
  options.seed_tracks = seed_tracks;
  options.limit = 25;

  return options;
}

module.exports = { calculateStats };
