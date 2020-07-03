const _ = require('underscore');
const user = require('./user');

function loadPlaylists(req) {
  return new Promise((resolve, reject) => {
    let allPlaylists = [];

    user.createLoggedInUser(req).then(loggedInSpotify => {
      // getUserId(loggedInSpotify).then(userData => {
      //   console.log(userData);
      // });
      console.log('Created user data:');
      // Create the starting playlist
      loggedInSpotify
        .getUserPlaylists({ limit: 50 })
        .then(playlists => {
          // console.log(playlists);
          allPlaylists = allPlaylists.concat(playlists.body.items);

          // How many calls to get all user playlists
          const numIters = Math.ceil((playlists.body.total - 50) / 50);
          const promiseArray = [];
          for (let i = 1; i <= numIters; i++) {
            const offsetVal = 50 * i + 1;
            promiseArray.push(loggedInSpotify.getUserPlaylists({ limit: 50, offset: offsetVal }));
          }

          Promise.all(promiseArray).then(allPlaylistArr => {
            // Extract the items from each call return
            allPlaylistArr = allPlaylistArr.map(x => x.body.items);

            // Concatenate all playlists
            const merged = [].concat.apply([], allPlaylistArr);
            allPlaylists = allPlaylists.concat(merged);

            const playlistExtractedData = allPlaylists.map(x => {
              return {
                name: x.name,
                image: x.images[0] ? x.images[0].url : '',
                id: x.id,
              };
            });

            resolve(playlistExtractedData);
          });
        })
        .catch(err => {
          console.log(err);
        });
    });
  });
}

// function extractDataPlaylists(playlists) {
//   return new Promise((resolve, reject) => {
//     const extractedData = []; // Array of playlist names and images
//
//     playlists.forEach(playlist => {
//       const imageData = playlist.images[0];
//       if (imageData) {
//         extractedData.push({
//           name: playlist.name,
//           image: imageData.url,
//         });
//       } else {
//         extractedData.push({
//           name: playlist.name,
//           image:
//             'https://c7.uihere.com/files/339/880/951/computer-icons-playlist-youtube-music-youtube-thumb.jpg',
//         });
//       }
//     });
//     resolve(extractedData);
//   });
//   // return new Promise((resolve, reject)=>{
//   //   playlists.forEach((playlist)=>{
//   //     console.log(playlist.name);
//   //     resolve("Hello");
//   //   }
//   // })
// }

function getPlaylistTracks(loggedInSpotify, playlistId) {
  return new Promise((resolve, reject) => {
    let allPlaylistTracks = [];
    // Can replace initial call with getPlaylist to get more details about the playlist
    loggedInSpotify.getPlaylistTracks(playlistId).then(tracks => {
      allPlaylistTracks = allPlaylistTracks.concat(tracks.body.items);

      console.log('Total tracks: ', tracks.body.total);

      // How many calls to get all tracks
      const numIters = Math.ceil((tracks.body.total - 100) / 100);
      const promiseArray = [];
      for (let i = 1; i <= numIters; i++) {
        const offsetVal = 100 * i + 1;
        promiseArray.push(loggedInSpotify.getPlaylistTracks(playlistId, { offset: offsetVal }));
      }

      Promise.all(promiseArray).then(allTracksArr => {
        // Extract the items from each call return
        allTracksArr = allTracksArr.map(x => x.body.items);

        // Concatenate all playlists
        const merged = [].concat.apply([], allTracksArr);
        allPlaylistTracks = allPlaylistTracks.concat(merged);

        console.log('Number of tracks in built list: ', allPlaylistTracks.length);
        resolve(allPlaylistTracks);
      });
    });
  });
}

function extractTrackFeatures(loggedInSpotify, tracks) {
  return new Promise((resolve, reject) => {
    const trackIds = tracks.map(x => x.track.id);
    const popularity = tracks.map(x => x.track.popularity);

    // Split the array of ids into chunks of 100 to make API calls
    const splitTracks = splitArrIntoChunks(trackIds, 100);

    const promiseArray = [];
    for (let i = 0; i < splitTracks.length; i++) {
      promiseArray.push(loggedInSpotify.getAudioFeaturesForTracks(splitTracks[i]));
    }

    Promise.all(promiseArray).then(allTrackFeatures => {
      // Extract the items from each call return
      allTrackFeatures = allTrackFeatures.map(x => x.body.audio_features);

      // Concatenate all track info
      const merged = [].concat.apply([], allTrackFeatures);

      const audioFeatures = buildTrackData(merged, popularity);
      resolve(audioFeatures);
    });
  });
}

function splitArrIntoChunks(array, chunkSize) {
  const splitArray = [];
  for (let i = 0, len = array.length; i < len; i += chunkSize)
    splitArray.push(array.slice(i, i + chunkSize));
  return splitArray;
}

function buildTrackData(trackData, popularity) {
  const danceability = trackData.map(x => x.danceability);
  const energy = trackData.map(x => x.energy);
  const key = trackData.map(x => x.key);
  const loudness = trackData.map(x => x.loudness);
  const mode = trackData.map(x => x.mode);
  const speechiness = trackData.map(x => x.speechiness);
  const acousticness = trackData.map(x => x.acousticness);
  const instrumentalness = trackData.map(x => x.instrumentalness);
  const liveness = trackData.map(x => x.liveness);
  const valence = trackData.map(x => x.valence);
  const tempo = trackData.map(x => x.tempo);

  return {
    danceability,
    energy,
    key,
    loudness,
    mode,
    speechiness,
    acousticness,
    instrumentalness,
    liveness,
    valence,
    tempo,
    popularity,
  };
}

function getListOfArtistsFromTracks(tracks) {
  return new Promise((resolve, reject) => {
    let artistIds = tracks.map(x => x.track.artists);
    const merged = [].concat.apply([], artistIds);
    artistIds = merged.map(x => x.id);
    resolve(artistIds);
  });
}

function getUserTopArtists(loggedInSpotify) {
  return new Promise((resolve, reject) => {
    const promiseArray = [];

    promiseArray.push(loggedInSpotify.getMyTopArtists({ limit: 50, time_range: 'short_term' }));
    promiseArray.push(loggedInSpotify.getMyTopArtists({ limit: 50, time_range: 'medium_term' }));
    promiseArray.push(loggedInSpotify.getMyTopArtists({ limit: 50, time_range: 'long_term' }));

    Promise.all(promiseArray)
      .then(allTopArtists => {
        // Extract the items from each call return
        allTopArtists = allTopArtists.map(x => x.body.items);

        // Concatenate all artists
        const merged = [].concat.apply([], allTopArtists);
        const topArtistIds = merged.map(x => x.id);
        resolve(topArtistIds);
      })
      .catch(error => {
        console.log(error);
      });
  });
}

/**
 * Calculates number of each artist occurrence in playlist and user's top artists and returns top x specified by num
 * @param {*} loggedInSpotify
 * @param {*} tracks
 * @param {*} numOfTopArtists Number of top artists to be returned
 */
async function getArtistRankRecommendations(loggedInSpotify, tracks, numOfTopArtists) {
  const promiseArray = [];
  promiseArray.push(getListOfArtistsFromTracks(tracks));
  promiseArray.push(getUserTopArtists(loggedInSpotify));

  let artistList = await Promise.all(promiseArray);

  // Filter top artists to only contain artists in the playlist
  artistList[1] = artistList[1].filter(item => artistList[0].indexOf(item) !== -1)

  // Merge all artist ids from both promises
  let artistIds = [].concat.apply([], artistList);

  // Shuffle the array
  artistIds = _.shuffle(artistIds);

  // Count number of occurrences of each id in array
  artistIds = _.countBy(artistIds);

  // Sort by count in descending order
  const sorted = Object.keys(artistIds).sort(function(a, b) {
    return -(artistIds[a] - artistIds[b]);
  });

  const rankedTopArtists = sorted.slice(0, numOfTopArtists);

  return rankedTopArtists;
}

function getUserTopSongs(loggedInSpotify) {
  return new Promise((resolve, reject) => {
    const promiseArray = [];

    // Get top 100 songs from all 3 time ranges
    promiseArray.push(loggedInSpotify.getMyTopTracks({ limit: 50, time_range: 'short_term' }));
    promiseArray.push(loggedInSpotify.getMyTopTracks({ limit: 50, time_range: 'medium_term' }));
    promiseArray.push(loggedInSpotify.getMyTopTracks({ limit: 50, time_range: 'long_term' }));
    promiseArray.push(
      loggedInSpotify.getMyTopTracks({ limit: 50, offset: 51, time_range: 'short_term' })
    );
    promiseArray.push(
      loggedInSpotify.getMyTopTracks({ limit: 50, offset: 51, time_range: 'medium_term' })
    );
    promiseArray.push(
      loggedInSpotify.getMyTopTracks({ limit: 50, offset: 51, time_range: 'long_term' })
    );

    Promise.all(promiseArray)
      .then(allTopTracks => {
        // Extract the items from each call return
        allTopTracks = allTopTracks.map(x => x.body.items);

        // Concatenate all artists
        const merged = [].concat.apply([], allTopTracks);
        const topTrackIds = merged.map(x => x.id);
        resolve(topTrackIds);
      })
      .catch(error => {
        console.log(error);
      });
  });
}

function getTrackRankRecommendations(loggedInSpotify, tracks, numOfTopTracks) {
  return new Promise((resolve, reject) => {
    const playlistTracks = tracks.map(x => x.track.id);
    getUserTopSongs(loggedInSpotify).then(topUserTracks => {
      let fullTrackList = topUserTracks.concat(playlistTracks);
      fullTrackList = _.shuffle(fullTrackList);
      // Count number of occurrences of each id in array
      fullTrackList = _.countBy(fullTrackList);
      // Sort by count in descending order
      const sorted = Object.keys(fullTrackList).sort(function(a, b) {
        return -(fullTrackList[a] - fullTrackList[b]);
      });

      const topXTracks = [];
      let count = 0;
      for (let i = 0; i < sorted.length; i++) {
        if (count === numOfTopTracks) {
          break;
        }
        if (_.contains(playlistTracks, sorted[i])) {
          topXTracks.push(sorted[i]);
          count++;
        }
      }
      resolve(topXTracks);
    });
  });
}

/**
 * Query spotify API for recommendations with the given parameters
 * @param loggedInSpotify
 * @param parameters
 */
async function getRecommendations(loggedInSpotify, parameters) {
  try {
    let recommendationList = await loggedInSpotify.getRecommendations(parameters);
    return recommendationList.body.tracks;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function createNewPlaylist(loggedInSpotify, playlistName, tracks) {
  let userID = await user.getUserId(loggedInSpotify);
  let response = await loggedInSpotify.createPlaylist(userID, playlistName);
  let link = response.body.external_urls.spotify;
  let playlistID = response.body.id;
  await loggedInSpotify.addTracksToPlaylist(playlistID, tracks);
  return link;
}

module.exports = {
  loadPlaylists,
  getPlaylistTracks,
  extractTrackFeatures,
  getListOfArtistsFromTracks,
  getUserTopArtists,
  getArtistRankRecommendations,
  getTrackRankRecommendations,
  getRecommendations,
  createNewPlaylist
};
