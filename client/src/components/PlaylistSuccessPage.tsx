import React from 'react';
import { Result, Button } from 'antd';
import ReactGA from 'react-ga';

const PlaylistSuccessPage = (props: { link: string | undefined }) => {
  return (
    <Result
      className="rounded-component"
      style={{
        padding: 0,
        paddingTop: '1em',
        paddingBottom: '1em',
        textAlign: 'center',
      }}
      status="success"
      title="Playlist created!"
      extra={[
        <Button type="primary" shape="round" size="large" key="spotifyLink">
          <a
            href={props.link}
            onClick={() => {
              ReactGA.event({
                category: 'Save playlist',
                action: 'View saved playlist',
              });
            }}
          >
            View on Spotify
          </a>
        </Button>,
      ]}
    />
  );
};

export default PlaylistSuccessPage;
