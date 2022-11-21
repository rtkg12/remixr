import React from 'react';
import { Typography, Input, Button } from 'antd';
import ReactGA from 'react-ga';

const { Title } = Typography;

const SavePlaylist = (props: {
  name: string;
  setName: (name: string) => void;
  isLoggedIn: boolean;
  saveHandler: React.MouseEventHandler<HTMLElement> | undefined;
  saveStateAndLogin: React.MouseEventHandler<HTMLElement> | undefined;
}) => {
  return (
    <div className="rounded-component" style={{ padding: '1em', textAlign: 'center' }}>
      <Title level={3}>Save Playlist</Title>

      <Input
        className="rounded"
        size="large"
        value={props.name}
        onChange={({ target: { value } }) => {
          props.setName(value);
          ReactGA.event({
            category: 'Save playlist',
            action: 'Change name',
          });
        }}
      />

      {props.isLoggedIn && props.isLoggedIn === true ? (
        <Button type="primary" shape="round" size="large" onClick={props.saveHandler} style={{ marginTop: '1em' }}>
          Save
        </Button>
      ) : (
        <Button
          type="primary"
          shape="round"
          size="large"
          onClick={props.saveStateAndLogin}
          style={{ marginTop: '1em' }}
        >
          Log in to save playlist
        </Button>
      )}
    </div>
  );
};

export default React.memo(SavePlaylist);
