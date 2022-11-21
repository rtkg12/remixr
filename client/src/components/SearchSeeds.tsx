import React, { useState } from 'react';
import { AutoComplete, Input } from 'antd';
import { Redirect } from 'react-router-dom';
import { search, extractArtistInfo, extractTrackInfo } from '../modules/Spotify';
import Cookies from 'js-cookie';
import ReactGA from 'react-ga';

const SearchSeeds = (props: {
  addSeed?: (item: { name: string; id: string; image: string }, type: string) => void;
}) => {
  const [accessToken] = useState<string | undefined>(Cookies.get('access_token'));
  const [value, setValue] = useState('');
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [seed, setSeed] = useState<{
    artists: { id: string; name: string; image?: string }[];
    tracks: { id: string; name: string; image?: string }[];
  } | null>(null);
  const [playlistSeed, setPlaylistSeed] = useState<{ name: string; id: string; image?: string } | null>(null);

  const searchSpotify = async (searchTerm: string) => {
    if (searchTerm && searchTerm.length > 0) {
      let { artists, tracks, playlists } = await search(accessToken, searchTerm);

      artists = artists.map(extractArtistInfo);
      tracks = tracks.map(extractTrackInfo);
      playlists = playlists.map(extractArtistInfo);

      setArtists(artists);
      setTracks(tracks);
      setPlaylists(playlists);
    }
  };

  const renderTitle = (title: string) => <span>{title}</span>;

  const renderItem = (item: { id: string; image?: string; name: string }, type: string) => ({
    key: item.id,
    data: item,
    type,
    value: item.id,
    label: (
      <div>
        <img src={item.image} className="rounded" width="50" height="50" alt="" />
        <span
          style={{
            marginLeft: '1em',
          }}
        >
          {item.name}
        </span>
      </div>
    ),
  });

  const options = [
    ...(!props || !props.addSeed
      ? [
          // Only display playlists on home page
          {
            label: renderTitle('Playlists'),
            options:
              playlists && playlists.length > 0 ? playlists.map(playlists => renderItem(playlists, 'playlist')) : [],
          },
        ]
      : []),
    {
      label: renderTitle('Tracks'),
      options: tracks && tracks.length > 0 ? tracks.map(track => renderItem(track, 'track')) : [],
    },
    {
      label: renderTitle('Artists'),
      options: artists && artists.length > 0 ? artists.map(artist => renderItem(artist, 'artist')) : [],
    },
  ];

  const addSeed = (value: string, option: any) => {
    if (props && props.addSeed) {
      // Results page
      ReactGA.event({
        category: 'Seeds',
        action: 'Add seed',
        label: 'Results',
      });

      props.addSeed(option.data, option.type);
      setValue('');
    } else {
      // Home page - Seed search
      ReactGA.event({
        category: 'Seeds',
        action: 'Add seed',
        label: 'Home page',
      });

      if (option.type === 'playlist') {
        ReactGA.event({
          category: 'Seeds',
          action: 'Add playlist',
          label: 'Home page',
        });
        setPlaylistSeed(option.data);
      } else if (option.type === 'track') {
        setSeed({ artists: [], tracks: [option.data] });
      } else {
        setSeed({ artists: [option.data], tracks: [] });
      }
    }
  };

  if (playlistSeed) {
    return (
      <Redirect
        to={{
          pathname: '/results',
          state: {
            playlist: {
              id: playlistSeed.id,
              name: playlistSeed.name,
              image: playlistSeed.image,
            },
          },
        }}
      />
    );
  }

  // For home page. Go to results after seed is added
  if (seed) {
    return (
      <Redirect
        to={{
          pathname: '/results',
          state: { seed },
        }}
      />
    );
  }

  return (
    <div>
      <AutoComplete
        style={{
          marginBottom: '0.5em',
          width: '100%',
          borderRadius: '10px',
        }}
        dropdownClassName="certain-category-search-dropdown"
        options={options}
        value={value}
        onChange={value => {
          searchSpotify(value);
          setValue(value);
        }}
        onSelect={addSeed}
      >
        <Input
          style={{
            borderRadius: '10px',
          }}
          size="large"
          placeholder={props.addSeed ? 'Add or remove seeds' : 'Discover based on playlists, songs or artists'}
        />
      </AutoComplete>
    </div>
  );
};

export default SearchSeeds;
