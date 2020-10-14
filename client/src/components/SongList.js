import React, {useContext, useState} from 'react';
import {Avatar, Col, List} from 'antd';
import CaretRightOutlined from '@ant-design/icons/CaretRightOutlined';
import PauseOutlined from '@ant-design/icons/PauseOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import ReactGA from 'react-ga';
import {Context} from "../store/Store";

const SongList = (props) => {
    const [sound, setSound] = useState();
    const [currentlyPlaying, setCurrentlyPlaying] = useState();
    const [state, dispatch] = useContext(Context);

    const playPreview = (preview_url, id) => {
        setSound(preview_url);
        setCurrentlyPlaying(id);
    };

    const stopPreview = () => {
        setSound(null);
        setCurrentlyPlaying(null);
    };

    const removeSong = (id) => {
        dispatch({type: 'UPDATE_SONGS', payload: state.songs.filter(song => song.id !== id)})
    }

    return (
        <List
            size="small"
            style={{marginBottom: '1em'}}
            itemLayout="horizontal"
            loading={props.loading}
            dataSource={state.songs}
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
                            <source src={sound}/>
                        </audio>
                    )}

                    <Col xs={22} sm={22} md={22} lg={14} xl={14}>
                        <List.Item.Meta
                            avatar={
                                <Avatar style={{borderRadius: '0.6em'}} shape="square" size={60}
                                        src={item.album.images[0].url}/>
                            }
                            title={item.name}
                            description={item.artists[0].name}
                        />
                    </Col>
                    <Col span={1}>
                        {item.preview_url ? (
                            currentlyPlaying === item.id ? (
                                <PauseOutlined
                                    style={{fontSize: '2em'}}
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
                                    style={{fontSize: '2em'}}
                                    onClick={() => {
                                        ReactGA.event({
                                            category: 'Playback',
                                            action: 'Button play',
                                        });
                                        playPreview(item.preview_url, item.id);
                                    }}
                                />
                            )
                        ) : null}
                    </Col>
                    <Col span={1}>
                        <CloseOutlined
                            style={{fontSize: '2em'}}
                            onClick={() => {
                                ReactGA.event({
                                    category: 'Remove',
                                    action: 'Button remove',
                                });
                                removeSong(item.id);
                            }}
                        />
                    </Col>
                </List.Item>
            )}
        />
    );
};

export default SongList;
