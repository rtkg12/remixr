import React, {useEffect, useState} from 'react'
import {Redirect} from "react-router-dom";
import axios from 'axios';
import {List, Avatar, Row, Col, Collapse, Typography, Affix} from 'antd';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';

import ParametersMenu from "./ParametersMenu";
import SavePlaylist from "./SavePlaylist";
import PlaylistSuccessPage from "./PlaylistSuccessPage";
import Navbar from "./Navbar";
import ErrorScreen from "./ErrorScreen";

const { Panel } = Collapse;
const {Title } = Typography;

const transport = axios.create({
    withCredentials: true
});

export default function Results(props) {
    const [songs, setSongs] = useState([]);
    const [playlist, setPlaylist] = useState({});
    const [loading, setLoading] = useState(true);
    const [sound, setSound] = useState();
    const [popularity, setPopularity] = useState({min: 0, max: 1});
    const [danceability, setDanceability] = useState({min: 0, max: 1});
    const [energy, setEnergy] = useState({min: 0, max: 1});
    const [acousticness, setAcousticness] = useState({min: 0, max: 1});
    const [valence, setValence] = useState({min: 0, max: 1});
    const [tempo, setTempo] = useState({min: 50, max: 200});
    const [seeds, setSeeds] = useState();
    const [currentlyPlaying, setCurrentlyPlaying] = useState();
    const [name, setName] = useState("");
    const [generatedPlaylistLink, setGeneratedPlaylistLink] = useState();
    const [error, setError] = useState(false);

    // Update generated songs if parameters are changed
    useEffect(() => {
        if (!loading) {
            setLoading(true);
            setGeneratedPlaylistLink(null);

            const url = process.env.REACT_APP_API_URL + "/recommendations";
            transport.post(url, {
                seeds,
                parameters: {popularity, danceability, energy, acousticness, valence, tempo}
            }).then(response => {
                console.log("Updated songs");
                setSongs(response.data.songs);
                setLoading(false);
            }, error => {
                console.log(error);
            });
        }
    }, [popularity, danceability, energy, tempo, acousticness, valence, seeds])

    // Fetch initial songs and load
    useEffect(() => {
        console.log("Rendered results");
        console.log(props);

        if (props.location.state) {
            setPlaylist(props.location.state.playlist);
        }

        if (props.location.state || (playlist && playlist.id)) {
            let id = playlist.id ? playlist.id : props.location.state.playlist.id;
            console.log(id);
            const url = process.env.REACT_APP_API_URL + "/results/" + id;

            transport.get(url).then(response => {
                console.log("Received response");
                console.log(response.data.songs);
                setSongs(response.data.songs);

                const parameters = response.data.parameters;

                console.log(parameters);

                setDanceability({
                    min: parameters.min_danceability,
                    max: parameters.max_danceability
                });

                setAcousticness({
                    min: parameters.min_acousticness,
                    max: parameters.max_acousticness
                });

                setPopularity({
                    min: parameters.min_popularity,
                    max: parameters.max_popularity
                });

                setEnergy({
                    min: parameters.min_energy,
                    max: parameters.max_energy
                });

                setValence({
                    min: parameters.min_valence,
                    max: parameters.max_valence
                });

                setTempo({
                    min: parameters.min_tempo,
                    max: parameters.max_tempo
                });

                setSeeds({
                    artists: parameters.seed_artists,
                    tracks: parameters.seed_tracks
                })

                let playlistName = playlist.name ? playlist.name : props.location.state.playlist.name;
                setName(`remixr:${playlistName}`);
                setLoading(false);
            }, (error) => {
                setError(true);
            });
        }
    }, []);

    // If invalid access
    if (!props.location.state || !props.location.state.playlist) {
        return <Redirect to="/"/>
    }

    const playPreview = (preview_url, id) => {
        setSound(preview_url);
        setCurrentlyPlaying(id);
    }

    const stopPreview = () => {
        setSound(null);
        setCurrentlyPlaying(null);
    }

    const savePlaylist = () => {
        const url = process.env.REACT_APP_API_URL + "/save";
        transport.post(url, {
            name,
            tracks: songs.map(item => item.uri)
        }).then(response => {
            console.log("Saved playlist");
            console.log(response);
            setGeneratedPlaylistLink(response.data.link);
        }, error => {
            console.log(error);
        });
    }

    if (error) {
        return (
            <ErrorScreen/>
        )
    }

    return (
        <div>
            <Navbar/>

            <Title style={{textAlign: "center"}} level={2}>Generated from: {playlist.name}</Title>

            <Row>
                {/* Mobile settings drawer */}
                <Col xs={24} sm={24} md={24} lg={0} xl={0}>
                    { !loading && generatedPlaylistLink ?
                        <PlaylistSuccessPage link={generatedPlaylistLink}/> :
                        <SavePlaylist name={name} setName={setName} saveHandler={savePlaylist}/>
                    }
                    <Collapse bordered={false} className="collapse-parameters rounded-component">
                        <Panel header="Tune Playlist Settings" key="1">
                            {!loading &&
                            <ParametersMenu
                                values={
                                    {energy, popularity, danceability, tempo, acousticness, valence}
                                }
                                handlers={
                                    {setEnergy, setPopularity, setDanceability, setTempo, setAcousticness, setValence}
                                }
                            />
                            }
                        </Panel>
                    </Collapse>
                </Col>

                {/* Songs */}
                <Col
                    xs={24} sm={24} md={24} lg={16} xl={16}
                >
                    <List
                        // style={{background:'#f4f4f8', borderRadius: '1em'}}
                        size='small'
                        itemLayout="horizontal"
                        loading={loading}
                        dataSource={songs}
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
                </Col>

                {/* Web settings drawer */}
                <Col xs={0} sm={0} md={0} lg={8} xl={8}>
                    <Affix offsetTop={70}>
                        { generatedPlaylistLink ?
                            <PlaylistSuccessPage link={generatedPlaylistLink}/> :
                            <SavePlaylist name={name} setName={setName} saveHandler={savePlaylist}/>
                        }
                        {!loading &&
                        <div className="parameters rounded-component">
                            <Title style={{textAlign: "center"}} level={3}>Tune playlist settings</Title>
                            <ParametersMenu
                                values = {
                                    {energy, popularity, danceability, tempo, acousticness, valence}
                                }
                                handlers = {
                                    {setEnergy, setPopularity, setDanceability, setTempo, setAcousticness, setValence}
                                }
                            />
                        </div>
                        }
                    </Affix>

                </Col>
            </Row>
        </div>
    )
}