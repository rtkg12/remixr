import SpotifyWebApi from 'spotify-web-api-node';
import axios from 'axios';
import { SearchType } from 'spotify-types';

interface RecommendationParameters {
  popularity: {
    min: number;
    max: number;
  };
  danceability: {
    min: number;
    max: number;
  };
  energy: {
    min: number;
    max: number;
  };
  acousticness: {
    min: number;
    max: number;
  };
  valence: {
    min: number;
    max: number;
  };
  tempo: {
    min: number;
    max: number;
  };
}

export interface Seeds {
  artists: { name: string; id: string; image: string }[];
  tracks: { name: string; id: string; image: string }[];
}

interface GetRecommendationsOptions {
  seed_artists: Array<string>;
  seed_tracks: Array<string>;
  limit: number;
  min_danceability: number;
  max_danceability: number;
  min_energy: number;
  max_energy: number;
  min_acousticness: number;
  max_acousticness: number;
  min_valence: number;
  max_valence: number;
  min_tempo: number;
  max_tempo: number;
  min_popularity: number;
  max_popularity: number;
}

const DEFAULT_ARTIST_IMAGE = '/images/artist.png';
const DEFAULT_TRACK_IMAGE = '/images/track.png';
const URI = process.env.REACT_APP_API_URL;

const authenticate = (accessToken: string) => {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);
  return spotifyApi;
};

const search = async (accessToken: string | undefined, searchTerm: string) => {
  const types = ['track', 'artist', 'album', 'playlist'];
  const limit = 3;
  let response;

  if (accessToken) {
    // Logged in
    const spotifyApi = authenticate(accessToken);
    response = await spotifyApi.search(searchTerm, types as SearchType[], { limit });
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

const getRecommendations = async (
  accessToken: string | undefined,
  parameters: RecommendationParameters,
  seeds: Seeds,
  limit: number
) => {
  let response;

  if (accessToken) {
    const spotifyApi = authenticate(accessToken);

    const params: GetRecommendationsOptions = {
      seed_artists: seeds.artists.map(artist => artist.id),
      seed_tracks: seeds.tracks.map(track => track.id),
      limit,
      min_danceability: parameters.danceability.min,
      max_danceability: parameters.danceability.max,
      min_energy: parameters.energy.min,
      max_energy: parameters.energy.max,
      min_acousticness: parameters.acousticness.min,
      max_acousticness: parameters.acousticness.max,
      min_valence: parameters.valence.min,
      max_valence: parameters.valence.max,
      min_tempo: parameters.tempo.min,
      max_tempo: parameters.tempo.max,
      min_popularity: parameters.popularity.min,
      max_popularity: parameters.popularity.max,
    };

    params.limit = limit;

    response = await spotifyApi.getRecommendations(params);
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
 * @returns {{image: (string), name: string, id: string}}
 */
const extractArtistInfo = (artist: {
  name: string;
  id: string;
  images?: { width: number; height: number; url: string }[];
}) => ({
  name: artist.name,
  id: artist.id,
  image: artist.images && artist.images.length > 0 ? artist.images[artist.images.length - 1].url : DEFAULT_ARTIST_IMAGE,
});

/**
 * Extracts track name, id and image from the HTTP track object
 * @param track
 * @returns {{image: (string), name: string, id: string}}
 */
const extractTrackInfo = (track: {
  name: string;
  id: string;
  album: { images?: { width: number; height: number; url: string }[] };
}) => ({
  name: track.name,
  id: track.id,
  image:
    track.album && track.album.images && track.album.images.length > 0
      ? track.album.images[track.album.images.length - 1].url
      : DEFAULT_TRACK_IMAGE,
});

const getArtists = async (accessToken: string | undefined, artistIds: string[]) => {
  let response;

  if (accessToken) {
    const spotifyApi = authenticate(accessToken);
    response = await spotifyApi.getArtists(artistIds);
  } else {
    response = await axios.get(`${URI}/artists`, {
      params: { artistIds },
    });
    response = response.data;
  }

  return response.body.artists.map(extractArtistInfo);
};

const getTracks = async (accessToken: string | undefined, trackIds: string[]) => {
  let response;

  if (accessToken) {
    const spotifyApi = authenticate(accessToken);
    response = await spotifyApi.getTracks(trackIds);
  } else {
    response = await axios.get(`${URI}/tracks`, {
      params: { trackIds },
    });
    response = response.data;
  }

  return response.body.tracks.map(extractTrackInfo);
};

export { authenticate, search, getRecommendations, extractArtistInfo, extractTrackInfo, getArtists, getTracks };
