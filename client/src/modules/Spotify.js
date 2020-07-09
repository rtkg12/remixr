const SpotifyWebApi = require('spotify-web-api-node');
const axios = require('axios');

const DEFAULT_ARTIST_IMAGE = "https://static.thenounproject.com/png/82078-200.png";
const DEFAULT_TRACK_IMAGE = "https://static.thenounproject.com/png/82078-200.png";
const URI = process.env.REACT_APP_API_URL;

const authenticate = (accessToken) => {
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(accessToken);
    return spotifyApi;
}

const getGenres = async (accessToken) => {
    const spotifyApi = authenticate(accessToken);
    return await spotifyApi.getAvailableGenreSeeds();
}

const search = async (accessToken, searchTerm) => {
    let types = ['track', 'artist'];
    let limit = 5;
    let response;

    if (accessToken) { // Logged in
        const spotifyApi = authenticate(accessToken);
        response = await spotifyApi.search(searchTerm, types, {limit});
    } else {
        response = await axios.get(`${URI}/search`, {
            params: {searchTerm, types, limit}
        });
        response = response.data;
    }

    return {
        artists: response.body.artists.items,
        tracks: response.body.tracks.items
    }
}

const getRecommendations = async (accessToken, parameters, seeds, limit) => {
    const spotify = authenticate(accessToken);

    let params = {};
    params.seed_artists = seeds.artists.map(artist => artist.id);
    params.seed_tracks = seeds.tracks.map(track => track.id);

    const relevant_features = [
        'danceability',
        'energy',
        'acousticness',
        'valence',
        'tempo',
        'popularity',
    ];

    for(let feature of relevant_features) {
        params[`min_${feature}`] = parameters[feature].min;
        params[`max_${feature}`] = parameters[feature].max;
    }

    params.limit = limit;

    let response = await spotify.getRecommendations(params);
    return response.body.tracks;
}

/**
 * Extracts artist name, id and image from the HTTP artist object
 * @param artist
 * @returns {{image: (*), name: *, id: *}}
 */
const extractArtistInfo = (artist) => ({
    name: artist.name,
    id: artist.id,
    image: artist.images && artist.images.length > 0
        ? artist.images[artist.images.length - 1].url
        : DEFAULT_ARTIST_IMAGE
});

/**
 * Extracts track name, id and image from the HTTP track object
 * @param track
 * @returns {{image: (*), name: *, id: *}}
 */
const extractTrackInfo = (track) => ({
    name: track.name,
    id: track.id,
    image: track.album && track.album.images && track.album.images.length > 0
        ? track.album.images[track.album.images.length - 1].url
        : DEFAULT_TRACK_IMAGE
});

export {
    authenticate,
    getGenres,
    search,
    getRecommendations,
    extractArtistInfo,
    extractTrackInfo
}