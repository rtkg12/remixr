import React, { useEffect, useState } from 'react';
import { Button, Typography, Switch } from 'antd';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import SearchSeeds from './SearchSeeds';
import axios from 'axios';
import ReactGA from 'react-ga';
import { FaSpotify } from 'react-icons/fa';
import NavButton from './NavButton';

const { Text } = Typography;

const transport = axios.create({
  withCredentials: true,
});

function Home() {
  const [accessToken, setAccessToken] = useState(Cookies.get('access_token'));
  const [refreshToken, setRefreshToken] = useState(Cookies.get('refresh_token'));

  useEffect(() => {
    ReactGA.pageview('/');
  }, []);

  const refresh = async () => {
    try {
      const url = process.env.REACT_APP_API_URL + '/refresh';
      let response = await transport.get(url);
      let expiry_time = new Date(new Date().getTime() + response.data.maxAge);
      Cookies.set('access_token', response.data.access_token, { expires: expiry_time });
      setAccessToken(response.data.access_token);
      ReactGA.event({
        category: 'Auth',
        action: 'Refreshed auth token',
        label: 'Home Page',
      });
    } catch (e) {
      setAccessToken(null);
      setRefreshToken(null);
    }
  };

  if (!accessToken && refreshToken) {
    refresh();
  }

  return (
    <div className="gradient">
      <div
        style={{
          position: 'absolute',
          right: '5%',
          marginTop: '1em',
        }}
      >
        <NavButton setAccessToken={setAccessToken} setRefreshToken={setRefreshToken} />
      </div>

      <div className="home center">
        <h1 className="title"> remixr </h1>
        <Text className="subtitle"> Discover new music based on playlists you love! </Text>
        <div>
          <div
            className="searchBox"
            style={{
              align: 'center',
              margin: '0 auto',
            }}
          >
            <SearchSeeds />
          </div>
          <Button
            shape="round"
            size="large"
            className="spotifyColor"
            style={{ marginTop: '0.5em' }}
            onClick={() => {
              ReactGA.event({
                category: 'Playlist',
                action: 'Click on playlist button',
                label: 'Home page',
              });

              if (!accessToken) {
                const URI = process.env.REACT_APP_API_URL;
                window.location = `${URI}/login?redirectTo=playlists`;
              } else {
                window.location = '/playlists';
              }
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <FaSpotify
                style={{
                  height: '1.5em',
                  width: '1.5em',
                  marginRight: '5px',
                }}
              />
              Select from my playlists
            </span>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
