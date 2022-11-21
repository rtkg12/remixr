import React from 'react';
import { Col, Card } from 'antd';
import { Link } from 'react-router-dom';
import ReactGA from 'react-ga';
import { Playlist } from './Playlists';

const { Meta } = Card;

const DEFAULT_IMAGE =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Simple_Music.svg/1024px-Simple_Music.svg.png';

const PlaylistCard = (props: { playlist: Playlist }) => {
  const imageURL = props.playlist.image && props.playlist.image !== '' ? props.playlist.image : DEFAULT_IMAGE;

  let image = (
    <img
      style={{
        borderTopLeftRadius: '1em',
        borderTopRightRadius: '1em',
        marginTop: '-1px',
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'cover',
      }}
      src={imageURL}
      alt=""
    />
  );

  return (
    <Col className="gutter-row" xs={12} sm={8} md={6} lg={6} xl={6}>
      <Link
        to={{
          pathname: '/results',
          state: {
            playlist: {
              id: props.playlist.id,
              name: props.playlist.name,
              image: imageURL,
            },
          },
        }}
        onClick={() => {
          ReactGA.event({
            category: 'Playlist',
            action: 'Click on playlist',
          });
        }}
      >
        <Card hoverable className="playlistCard" cover={image}>
          <Meta title={props.playlist.name} />
        </Card>
      </Link>
    </Col>
  );
};

export default PlaylistCard;
