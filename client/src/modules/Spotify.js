const SpotifyWebApi = require('spotify-web-api-node');

const DEFAULT_ARTIST_IMAGE = "https://static.thenounproject.com/png/82078-200.png";
const DEFAULT_TRACK_IMAGE = "https://static.thenounproject.com/png/82078-200.png";

const authenticate = (accessToken) => {
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(accessToken);
    return spotifyApi;
}

module.exports.getGenres = async (accessToken) => {
    const spotifyApi = authenticate(accessToken);
    return await spotifyApi.getAvailableGenreSeeds();
}

module.exports.search = async (accessToken, searchTerm) => {
    const spotifyApi = authenticate(accessToken);
    return await spotifyApi.search(searchTerm, ['track', 'artist'], {limit: 5});
}

module.exports.getRecommendations = async (accessToken, parameters, seeds, limit) => {
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
module.exports.extractArtistInfo = (artist) => ({
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
module.exports.extractTrackInfo = (track) => ({
    name: track.name,
    id: track.id,
    image: track.album && track.album.images && track.album.images.length > 0
        ? track.album.images[track.album.images.length - 1].url
        : DEFAULT_TRACK_IMAGE
});

module.exports.authenticate = authenticate;