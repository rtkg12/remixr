import React, {useState} from 'react';
import {Avatar, Col, List} from "antd";
import {CaretRightOutlined, PauseOutlined} from "@ant-design/icons";

const SongList = (props) => {
    const [sound, setSound] = useState();
    const [currentlyPlaying, setCurrentlyPlaying] = useState();

    const playPreview = (preview_url, id) => {
        setSound(preview_url);
        setCurrentlyPlaying(id);
    }

    const stopPreview = () => {
        setSound(null);
        setCurrentlyPlaying(null);
    }

    return (
        <List
            size='small'
            itemLayout="horizontal"
            loading={props.loading}
            dataSource={props.songs}
            renderItem={item => (
                <List.Item
                    style={{borderBottom: 'none'}}
                    key={item.id}
                    onMouseEnter={() => { playPreview(item.preview_url, item.id) }}
                    onMouseLeave={ stopPreview }
                >
                    {sound && currentlyPlaying === item.id &&
                    <audio autoPlay={true} loop={true}>
                        <source src={sound}/>
                    </audio>
                    }

                    <Col xs={22} sm={22} md={22} lg={14} xl={14} >
                        <List.Item.Meta
                            avatar={<Avatar style={{borderRadius: '0.6em'}} shape='square' size={60} src={item.album.images[0].url} />}
                            title={item.name}
                            description={item.artists[0].name}
                        />
                    </Col>
                    <Col span={2} >
                        {item.preview_url ?
                            currentlyPlaying === item.id ?
                                <PauseOutlined style={{fontSize: '2em'}} onClick={stopPreview}/> :
                                <CaretRightOutlined
                                    style={{fontSize: '2em'}}
                                    onClick={() => {playPreview(item.preview_url, item.id)}}
                                />
                            : null
                        }
                    </Col>
                </List.Item>
            )}
        />
    );
};

export default SongList;
