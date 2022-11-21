import React, { useState } from 'react';
import { AutoComplete, Input } from 'antd';
import { Redirect } from 'react-router-dom';
import { search, extractArtistInfo, extractTrackInfo } from '../modules/Spotify';
import Cookies from 'js-cookie';
import ReactGA from 'react-ga';

const SearchPlaylists = (props: {
  addSeed?: (item: { name: string; id: string; image?: string }, type: string) => void;
}) => {
  const [accessToken] = useState(Cookies.get('access_token'));
  const [value, setValue] = useState('');
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [seed, setSeed] = useState<{ artists: any[]; tracks: any[] } | null>(null);

  const searchSpotify = async (searchTerm: string) => {
    if (searchTerm && searchTerm.length > 0) {
      let { artists, tracks } = await search(accessToken, searchTerm);

      artists = artists.map(extractArtistInfo);
      tracks = tracks.map(extractTrackInfo);

      setArtists(artists);
      setTracks(tracks);
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
      // Home page
      ReactGA.event({
        category: 'Seeds',
        action: 'Add seed',
        label: 'Home page',
      });

      if (option.type === 'track') {
        setSeed({ artists: [], tracks: [option.data] });
      } else {
        setSeed({ artists: [option.data], tracks: [] });
      }
    }
  };

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
          placeholder={props.addSeed ? 'Add or remove seeds' : 'Discover based on artists or songs'}
        />
      </AutoComplete>
    </div>
  );
};

export default SearchPlaylists;
