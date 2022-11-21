import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Divider, Input, Row, Typography, Skeleton, AutoComplete } from 'antd';
import Cookies from 'js-cookie';
import axios from 'axios';
import ReactGA from 'react-ga';

import Navbar from './Navbar';
import ErrorScreen from './ErrorScreen';
import PlaylistCard from './PlaylistCard';

export interface Playlist {
  id: string;
  name: string;
  image?: string;
}

const { Title } = Typography;

const transport = axios.create({
  withCredentials: true,
});

const Playlist = () => {
  const [accessToken] = useState(Cookies.get('access_token'));
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (accessToken) {
      ReactGA.pageview('/playlists');
      let url = process.env.REACT_APP_API_URL + '/playlists';

      transport.get(url).then(
        response => {
          setPlaylists(response.data.playlists);
          setFilteredPlaylists(response.data.playlists);
          setLoading(false);
        },
        error => {
          setError(true);
        }
      );
    }
  }, []);

  if (!accessToken) {
    return <Redirect to="/" />;
  }

  const filter = (searchTerm: string) => {
    setFilteredPlaylists(playlists.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())));
    ReactGA.event({
      category: 'Playlist',
      action: 'Search playlists',
    });
  };

  if (error) {
    return <ErrorScreen />;
  }

  return (
    <div className="playlists">
      <Navbar />

      <Title> Select playlist </Title>

      <AutoComplete className="searchBox" onSearch={filter}>
        <Input className="rounded" size="large" placeholder="Filter Playlists" />
      </AutoComplete>

      <Divider />

      <div>
        <Row gutter={[16, 24]}>
          {loading && <Skeleton active />}
          {filteredPlaylists &&
            filteredPlaylists.map(item => {
              return <PlaylistCard playlist={item} key={item.id} />;
            })}
        </Row>
      </div>
    </div>
  );
};

export default Playlist;
