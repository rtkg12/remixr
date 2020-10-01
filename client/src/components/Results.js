import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Vibrant from 'node-vibrant';
import { Row, Col, Collapse, Typography, Affix, Tag, message, Space } from 'antd';
import ReactGA from 'react-ga';

import ParametersMenu from './ParametersMenu';
import SavePlaylist from './SavePlaylist';
import PlaylistSuccessPage from './PlaylistSuccessPage';
import Navbar from './Navbar';
import ErrorScreen from './ErrorScreen';
import SongList from './SongList';
import SearchSeeds from './SearchSeeds';

import { authenticate, getRecommendations, getArtists, getTracks, checkContainTrack, addToMySavedTracks, removeFromMySavedTracks, getMySavedTracks } from '../modules/Spotify.js';

import Cookies from 'js-cookie';
import { Redirect } from 'react-router-dom';

const { Panel } = Collapse;
const { Title } = Typography;

const transport = axios.create({
  withCredentials: true,
});

const trackMethods = {
  checkContainTrack, addToMySavedTracks, removeFromMySavedTracks, getMySavedTracks
}
/**
 * Check if results state stored in localstorage
 */
const checkStateStored = () => {
  return (
    localStorage.getItem('songs') &&
    localStorage.getItem('playlist') &&
    localStorage.getItem('name') &&
    localStorage.getItem('count') &&
    localStorage.getItem('popularity') &&
    localStorage.getItem('danceability') &&
    localStorage.getItem('energy') &&
    localStorage.getItem('acousticness') &&
    localStorage.getItem('valence') &&
    localStorage.getItem('tempo') &&
    localStorage.getItem('seeds') &&
    localStorage.getItem('seedColors')
  );
};

export default function Results(props) {
  const [accessToken] = useState(Cookies.get('access_token'));
  const [songs, setSongs] = useState([]);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('remixr');
  const [generatedPlaylistLink, setGeneratedPlaylistLink] = useState();
  const [error, setError] = useState(false);
  const initialFetchComplete = useRef(false);
  // Parameters
  const [count, setCount] = useState(25);
  const [popularity, setPopularity] = useState({ min: 0, max: 100 });
  const [danceability, setDanceability] = useState({ min: 0, max: 1 });
  const [energy, setEnergy] = useState({ min: 0, max: 1 });
  const [acousticness, setAcousticness] = useState({ min: 0, max: 1 });
  const [valence, setValence] = useState({ min: 0, max: 1 });
  const [tempo, setTempo] = useState({ min: 50, max: 200 });
  const [seeds, setSeeds] = useState();
  const [seedColors, setSeedColors] = useState({});

  /**
   * Save state to localstorage before redirecting to login page. Used for maintaining the same playlist items after being logged in
   */
  const saveStateAndLogin = () => {
    localStorage.setItem('songs', JSON.stringify(songs));
    localStorage.setItem('playlist', JSON.stringify(playlist));
    localStorage.setItem('name', JSON.stringify(name));
    localStorage.setItem('count', JSON.stringify(count));
    localStorage.setItem('popularity', JSON.stringify(popularity));
    localStorage.setItem('danceability', JSON.stringify(danceability));
    localStorage.setItem('energy', JSON.stringify(energy));
    localStorage.setItem('acousticness', JSON.stringify(acousticness));
    localStorage.setItem('valence', JSON.stringify(valence));
    localStorage.setItem('tempo', JSON.stringify(tempo));
    localStorage.setItem('seeds', JSON.stringify(seeds));
    localStorage.setItem('seedColors', JSON.stringify(seedColors));

    const URI = process.env.REACT_APP_API_URL;
    window.location = `${URI}/login?redirectTo=results`;
  };

  /**
   * Check if state is done updating from local storage
   * @returns {boolean|boolean}
   */
  const checkStateUpdatedFromStorage = () => {
    return (
      JSON.stringify(songs) === localStorage.getItem('songs') &&
      JSON.stringify(playlist) === localStorage.getItem('playlist') &&
      JSON.stringify(name) === localStorage.getItem('name') &&
      JSON.stringify(count) === localStorage.getItem('count') &&
      JSON.stringify(popularity) === localStorage.getItem('popularity') &&
      JSON.stringify(danceability) === localStorage.getItem('danceability') &&
      JSON.stringify(energy) === localStorage.getItem('energy') &&
      JSON.stringify(acousticness) === localStorage.getItem('acousticness') &&
      JSON.stringify(valence) === localStorage.getItem('valence') &&
      JSON.stringify(tempo) === localStorage.getItem('tempo') &&
      JSON.stringify(seeds) === localStorage.getItem('seeds') &&
      JSON.stringify(seedColors) === localStorage.getItem('seedColors')
    );
  };

  /**
   * Restore results page state from localstorage
   */
  const restoreState = () => {
    setLoading(true);
    initialFetchComplete.current = false;

    setSongs(JSON.parse(localStorage.getItem('songs')));
    setPlaylist(JSON.parse(localStorage.getItem('playlist')));
    setName(JSON.parse(localStorage.getItem('name')));
    setCount(JSON.parse(localStorage.getItem('count')));
    setPopularity(JSON.parse(localStorage.getItem('popularity')));
    setDanceability(JSON.parse(localStorage.getItem('danceability')));
    setEnergy(JSON.parse(localStorage.getItem('energy')));
    setAcousticness(JSON.parse(localStorage.getItem('acousticness')));
    setValence(JSON.parse(localStorage.getItem('valence')));
    setTempo(JSON.parse(localStorage.getItem('tempo')));
    setSeeds(JSON.parse(localStorage.getItem('seeds')));
    setSeedColors(JSON.parse(localStorage.getItem('seedColors')));

    setLoading(false);
  };

  // Fetch initial songs and load
  useEffect(() => {
    ReactGA.pageview('/results');
    ReactGA.set({ userId: Cookies.get('userID') });

    if (checkStateStored()) {
      restoreState();
    } else if (props?.location?.state?.seed) {
      initialFetchComplete.current = true;
      setSeeds(props.location.state.seed);
      setLoading(false);
    } else {
      // Immediately Invoked Function Expression
      (async () => {
        if (props?.location?.state?.playlist) {
          setPlaylist(props.location.state.playlist);
        }

        if (props?.location?.state?.playlist?.id || playlist?.id) {
          let id = playlist?.id || props?.location?.state?.playlist?.id;
          const url = process.env.REACT_APP_API_URL + '/results/' + id;

          try {
            let response = await transport.get(url);

            setSongs(response.data.songs);

            const parameters = response.data.parameters;

            setDanceability({
              min: parameters.min_danceability,
              max: parameters.max_danceability,
            });

            setAcousticness({
              min: parameters.min_acousticness,
              max: parameters.max_acousticness,
            });

            setPopularity({
              min: parameters.min_popularity,
              max: parameters.max_popularity,
            });

            setEnergy({
              min: parameters.min_energy,
              max: parameters.max_energy,
            });

            setValence({
              min: parameters.min_valence,
              max: parameters.max_valence,
            });

            setTempo({
              min: parameters.min_tempo,
              max: parameters.max_tempo,
            });

            let [artists, tracks] = await Promise.all([
              getArtists(accessToken, parameters.seed_artists),
              getTracks(accessToken, parameters.seed_tracks),
            ]);

            setSeeds({
              artists: artists,
              tracks: tracks,
            });

            let playlistName = playlist?.name || props?.location?.state?.playlist?.name;
            setName(`remixr:${playlistName}`);
            initialFetchComplete.current = true;
            setLoading(false);
          } catch (e) {
            console.log(e);
            setError(true);
          }
        }
      })();
    }
  }, []);

  // Update generated songs if parameters are changed
  useEffect(() => {
    if (!loading && initialFetchComplete.current) {
      // To prevent effect from refreshing songlist while restoring from localStorage
      console.log('Running seeds effect');
      setLoading(true);
      setGeneratedPlaylistLink(null);

      let parameters = {
        popularity,
        danceability,
        energy,
        acousticness,
        valence,
        tempo,
      };

      getRecommendations(accessToken, parameters, seeds, count)
        .then((songs) => {
          setSongs(songs);
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setError(true);
        });
    } else if (checkStateStored() && checkStateUpdatedFromStorage()) {
      // Runs once state is fully restored from local storage
      initialFetchComplete.current = true;
      localStorage.clear();
    }
  }, [count, popularity, danceability, energy, tempo, acousticness, valence, seeds]);

  // Calculate colors for seeds
  useEffect(() => {
    // Using IIFE for async effect
    seeds &&
      seeds.artists &&
      seeds.tracks &&
      (async () => {
        let items = [...seeds.artists, ...seeds.tracks];
        let promiseArray = [...seeds.artists, ...seeds.tracks].map((item) =>
          Vibrant.from(item.image)
            .getPalette()
            .then((palette) => palette.Vibrant._rgb.toString())
        );
        let colors = await Promise.all(promiseArray);

        let colorStyles = {};

        for (let i = 0; i < items.length; i++) {
          colorStyles[items[i].id] = `rgba(${colors[i]},0.6)`;
        }

        setSeedColors(colorStyles);
      })();
  }, [seeds]);

  // If invalid access
  if (!(props?.location?.state?.playlist || props?.location?.state?.seed || checkStateStored() || songs)) {
    return <Redirect to="/" />;
  }

  const savePlaylist = () => {
    ReactGA.event({
      category: 'Save playlist',
      action: 'Click save button',
    });

    const url = process.env.REACT_APP_API_URL + '/save';
    transport
      .post(url, {
        name,
        tracks: songs.map((item) => item.uri),
      })
      .then(
        (response) => {
          console.log('Saved playlist');
          console.log(response);
          setGeneratedPlaylistLink(response.data.link);
        },
        (error) => {
          console.log(error);
        }
      );
  };

  const removeSeed = (item, type) => {
    ReactGA.event({
      category: 'Seeds',
      action: 'Remove seed',
      label: 'Results',
    });

    if (seeds.artists.length + seeds.tracks.length <= 1) {
      message.error('Cannot remove all seeds');
      ReactGA.event({
        category: 'Seeds',
        action: 'Remove all seeds error',
        label: 'Results',
      });
    } else {
      setSeeds({
        artists: type === 'artist' ? seeds.artists.filter((artist) => artist.id !== item.id) : seeds.artists,
        tracks: type === 'track' ? seeds.tracks.filter((track) => track.id !== item.id) : seeds.tracks,
      });
    }
  };

  const addSeed = (item, type) => {
    if (seeds.artists.length + seeds.tracks.length >= 5) {
      message.error('Cannot add more than five seeds');
      ReactGA.event({
        category: 'Seeds',
        action: 'Add extra seeds error',
        label: 'Results',
      });
    } else {
      setSeeds({
        artists: type === 'artist' ? [...seeds.artists, item] : seeds.artists,
        tracks: type === 'track' ? [...seeds.tracks, item] : seeds.tracks,
      });
    }
  };

  const seedTags = (
    <Space className="tagsList" size={1}>
      {seeds &&
        seeds.artists &&
        seeds.artists.map((artist) => (
          <Tag
            style={
              seedColors &&
              seedColors[artist.id] && {
                backgroundColor: seedColors[artist.id],
              }
            }
            className="seedTag"
            key={artist.id}
            closable
            onClose={(e) => {
              e.preventDefault();
              removeSeed(artist, 'artist');
            }}
          >
            <img src={artist.image} width={60} height={60} alt="" />
            <div className="tagName">
              <span>{artist.name}</span>
            </div>
          </Tag>
        ))}

      {seeds &&
        seeds.tracks &&
        seeds.tracks.map((track) => (
          <Tag
            className="seedTag"
            style={seedColors && seedColors[track.id] && { backgroundColor: seedColors[track.id] }}
            key={track.id}
            closable
            onClose={(e) => {
              e.preventDefault();
              removeSeed(track, 'track');
            }}
          >
            <img src={track.image} width={60} height={60} alt="" />
            <div className="tagName">
              <span>{track.name}</span>
            </div>
          </Tag>
        ))}
    </Space>
  );

  const parametersMenu = (
    <ParametersMenu
      values={{
        count,
        energy,
        popularity,
        danceability,
        tempo,
        acousticness,
        valence,
      }}
      handlers={{
        setCount,
        setEnergy,
        setPopularity,
        setDanceability,
        setTempo,
        setAcousticness,
        setValence,
      }}
    />
  );

  const access_token = Cookies.get('access_token');
  const isLoggedIn = access_token !== undefined && access_token !== null && access_token !== '';

  const savePlaylistMenu = (
    <SavePlaylist
      name={name}
      setName={setName}
      saveHandler={savePlaylist}
      isLoggedIn={isLoggedIn}
      saveStateAndLogin={saveStateAndLogin}
    />
  );

  const playlistSuccessPage = <PlaylistSuccessPage link={generatedPlaylistLink} />;

  if (error) {
    return <ErrorScreen />;
  }

  return (
    <div>
      <Navbar />

      {playlist ? (
        <Title style={{ textAlign: 'center' }} level={2}>
          Generated from: {playlist.name}
        </Title>
      ) : null}

      <SearchSeeds addSeed={addSeed} />
      {seedTags}
      <Row>
        {/* Mobile settings drawer */}
        <Col xs={24} sm={24} md={24} lg={0} xl={0}>
          {!loading && generatedPlaylistLink ? playlistSuccessPage : savePlaylistMenu}
          <Collapse
            bordered={false}
            className="collapse-parameters rounded-component"
            onClick={() => {
              ReactGA.event({
                category: 'Parameters',
                action: 'Opened parameters on Mobile',
              });
            }}
          >
            <Panel header="Tune Playlist Settings" key="1">
              {!loading && parametersMenu}
            </Panel>
          </Collapse>
        </Col>

        {/* Songs */}
        <Col xs={24} sm={24} md={24} lg={16} xl={16}>
          <SongList loading={loading} songs={songs} accessToken={accessToken} trackMethods={trackMethods}/>
        </Col>

        {/* Web settings drawer */}
        <Col xs={0} sm={0} md={0} lg={8} xl={8}>
          <Affix offsetTop={70}>
            {generatedPlaylistLink ? playlistSuccessPage : savePlaylistMenu}
            {!loading && (
              <div className="parameters rounded-component">
                <Title style={{ textAlign: 'center' }} level={3}>
                  Tune playlist settings
                </Title>
                {parametersMenu}
              </div>
            )}
          </Affix>
        </Col>
      </Row>
    </div>
  );
}
