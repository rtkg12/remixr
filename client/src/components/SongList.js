import React, { useState,useEffect} from 'react';
import { Avatar, Col, List } from 'antd';
import CaretRightOutlined from '@ant-design/icons/CaretRightOutlined';
// import ExclamationCircleFilled from '@ant-design/icons/ExclamationCircleFilled'
// import HeartTwoTone from '@ant-design/icons/HeartTwoTone';
import PauseOutlined from '@ant-design/icons/PauseOutlined';
import ReactGA from 'react-ga';
import { FaHeart, FaExclamationTriangle } from 'react-icons/fa';
import { checkContainTrack, addToMySavedTracks, removeFromMySavedTracks, getMySavedTracks } from '../modules/Spotify';
import Cookies from 'js-cookie';


const SongList = (props) => {
  const [sound, setSound] = useState();
  const [currentlyPlaying, setCurrentlyPlaying] = useState();
  const [accessToken] = useState(Cookies.get('access_token'));
  const [likedSongs] = useState(new Set([]));

  useEffect(()=>{

    (async()=>{
      let savedTracks = await getMySavedTracks(accessToken);
      savedTracks.body.items.forEach(item=> likedSongs.add(item.track.id));
    })();

  });
  const playPreview = (preview_url, id) => {
    setSound(preview_url);
    setCurrentlyPlaying(id);
  };

  const stopPreview = () => {
    setSound(null);
    setCurrentlyPlaying(null);
  };

  const likeSongs = (id) => {
    
    (async()=>{
      const isLiked = await checkContainTrack(accessToken,[id]);
      if (!isLiked.body[0]) {
        likedSongs.add(id);
        await addToMySavedTracks(accessToken,[id]);
      } else {
        likedSongs.delete(id);
        await removeFromMySavedTracks(accessToken,[id]);
      };  
    })()
  };

  return (
    <List
      size="small"
      style={{ marginBottom: '1em' }}
      itemLayout="horizontal"
      loading={props.loading}
      dataSource={props.songs}
      renderItem={(item) => (
        <List.Item
          className="playlistItem"
          style={{
            borderBottom: 'none',
          }}
          key={item.id}
          onMouseEnter={() => {
            ReactGA.event({
              category: 'Playback',
              action: 'Hover play',
            });
            playPreview(item.preview_url, item.id);
          }}
          onMouseLeave={() => {
            ReactGA.event({
              category: 'Playback',
              action: 'Hover pause',
            });
            stopPreview();
          }}
        >
          {sound && currentlyPlaying === item.id && (
            <audio autoPlay={true} loop={true}>
              <source src={sound} />
            </audio>
          )}

          <Col xs={22} sm={22} md={22} lg={12} xl={12}>
            <List.Item.Meta
              avatar={
                <Avatar style={{ borderRadius: '0.6em' }} shape="square" size={60} src={item.album.images[0].url} />
              }
              title={item.name}
              description={item.artists[0].name}
            />
          </Col>
          
          <Col span={2} style={{display:'flex', justifyContent:'space-between',flexWrap:'wrap',alignItems:'center'}}>
          <FaHeart
                style={{
                  color: likedSongs.has(item.id)? "#68eb64":"black",
                  cursor: "pointer",
                  fontSize:'1.4em'
                }}
              onClick={()=>likeSongs(item.id)}/>
            {item.preview_url ? (
              currentlyPlaying === item.id ? (
                <PauseOutlined
                  style={{ fontSize: '2em' }}
                  onClick={() => {
                    ReactGA.event({
                      category: 'Playback',
                      action: 'Button pause',
                    });
                    stopPreview();
                  }}
                />
              ) : (
                <CaretRightOutlined
                  style={{ fontSize: '2em' }}
                  onClick={() => {
                    ReactGA.event({
                      category: 'Playback',
                      action: 'Button play',
                    });
                    playPreview(item.preview_url, item.id);
                  }}
                />
              )
            ) : <FaExclamationTriangle  style={{
              color: "orange",
              cursor: "pointer",
              fontSize: '1.4em'
            }}/>}
          </Col>
        </List.Item>
      )}
    />
  );
};

export default SongList;
