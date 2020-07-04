import React, {useEffect, useState} from 'react'
import axios from 'axios';
import Vibrant from 'node-vibrant'
import {Row, Col, Collapse, Typography, Affix, Tag, message, Space} from 'antd';

import ParametersMenu from "./ParametersMenu";
import SavePlaylist from "./SavePlaylist";
import PlaylistSuccessPage from "./PlaylistSuccessPage";
import Navbar from "./Navbar";
import ErrorScreen from "./ErrorScreen";
import SongList from "./SongList";
import SearchSeeds from "./SearchSeeds";

import {authenticate, getRecommendations, extractArtistInfo, extractTrackInfo} from "../modules/Spotify";
import Cookies from "js-cookie";

const { Panel } = Collapse;
const {Title } = Typography;

const transport = axios.create({
    withCredentials: true
});

export default function Results(props) {
    const [accessToken] = useState(Cookies.get('access_token'));
    const [songs, setSongs] = useState([]);
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("remixr");
    const [generatedPlaylistLink, setGeneratedPlaylistLink] = useState();
    const [error, setError] = useState(false);
    // Parameters
    const [count, setCount] = useState(25);
    const [popularity, setPopularity] = useState({min: 0, max: 100});
    const [danceability, setDanceability] = useState({min: 0, max: 1});
    const [energy, setEnergy] = useState({min: 0, max: 1});
    const [acousticness, setAcousticness] = useState({min: 0, max: 1});
    const [valence, setValence] = useState({min: 0, max: 1});
    const [tempo, setTempo] = useState({min: 50, max: 200});
    const [seeds, setSeeds] = useState();
    const [seedColors, setSeedColors] = useState({});

    // Fetch initial songs and load
    useEffect(() => {
        // Immediately Invoked Function Expression
        (async () => {
            if (props.location.state) {
                if (props.location.state.playlist) {
                    setPlaylist(props.location.state.playlist);
                } else if (props.location.state.seed) {
                    setSeeds(props.location.state.seed);
                    console.log("Added seed");
                    setLoading(false);
                }
            }

            if ((props.location.state && props.location.state.playlist && props.location.state.playlist.id) || (playlist && playlist.id)) {
                let id = playlist ? playlist.id : props.location.state.playlist.id;
                const url = process.env.REACT_APP_API_URL + "/results/" + id;

                try {
                    let response = await transport.get(url);

                    setSongs(response.data.songs);
                    const parameters = response.data.parameters;

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

                    const spotify = authenticate(accessToken);

                    let data = await Promise.all([
                        spotify.getArtists(parameters.seed_artists),
                        spotify.getTracks(parameters.seed_tracks)
                    ]);

                    let artists = data[0].body.artists.map(extractArtistInfo);
                    let tracks = data[1].body.tracks.map(extractTrackInfo);

                    setSeeds({
                        artists: artists,
                        tracks: tracks
                    });

                    let playlistName = playlist ? playlist.name : props.location.state.playlist.name;
                    setName(`remixr:${playlistName}`);
                    setLoading(false);
                } catch (e) {
                    console.log(e);
                    setError(true);
                }
            }
        })();
    }, [])

    // Update generated songs if parameters are changed
    useEffect(() => {
        if (!loading) {
            setLoading(true);
            setGeneratedPlaylistLink(null);

            let parameters = {popularity, danceability, energy, acousticness, valence, tempo};
            getRecommendations(accessToken, parameters, seeds, count).then(songs => {
                setSongs(songs);
                setLoading(false);
            }).catch(error => console.log(error));
        }
    }, [count, popularity, danceability, energy, tempo, acousticness, valence, seeds])

    // Calculate colors for seeds
    useEffect(() => {
        console.log("Calculating colors");
        // Using IIFE for async effect
        seeds && seeds.artists && seeds.tracks && ( async () => {
            let items = [...seeds.artists, ...seeds.tracks];
            let promiseArray = [...seeds.artists, ...seeds.tracks].map(item => Vibrant.from(item.image).getPalette().then(palette => palette.Vibrant._rgb.toString()));
            let colors = await Promise.all(promiseArray);

            let colorStyles = {};

            for (let i = 0; i < items.length; i++) {
                colorStyles[items[i].id] = `rgba(${colors[i]},0.4)`;
            }

            setSeedColors(colorStyles);
        })();
    }, [seeds]);

    // If invalid access
    // if (!props.location.state || !props.location.state.playlist) {
    //     return <Redirect to="/"/>
    // }

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

    const removeSeed = (item, type) => {
        if (seeds.artists.length + seeds.tracks.length <= 1) {
            message.error("Cannot remove all seeds");
        } else {
            setSeeds({
                artists: type === "artist" ? seeds.artists.filter(artist => artist.id !== item.id): seeds.artists,
                tracks: type === "track" ? seeds.tracks.filter(track => track.id !== item.id): seeds.tracks
            });
        }
    }

    const addSeed = (item, type) => {
        if (seeds.artists.length + seeds.tracks.length >= 5) {
            message.error("Cannot add more than five seeds");
        } else {
            setSeeds({
                artists: type === "artist" ? [...seeds.artists, item]: seeds.artists,
                tracks: type === "track" ? [...seeds.tracks, item]: seeds.tracks
            });
        }
    }

    const seedTags = (
        <Space className="tagsList" size={1}>
            {seeds && seeds.artists && seeds.artists.map(artist =>
                <Tag
                    style={seedColors && seedColors[artist.id] && {backgroundColor: seedColors[artist.id]}}
                    className="seedTag"
                    key={artist.id}
                    closable
                    onClose={e => {
                        e.preventDefault();
                        removeSeed(artist, "artist");
                    }}
                >
                    <img src={artist.image} width={60} height={60} alt=""/>
                    <div className="tagName">
                        <span>
                            {artist.name}
                        </span>
                    </div>
                </Tag>
            )}

            {seeds && seeds.tracks && seeds.tracks.map(track =>
                <Tag
                    className="seedTag"
                    style={seedColors && seedColors[track.id] && {backgroundColor: seedColors[track.id]}}
                    key={track.id}
                    closable
                    onClose={e => {
                        e.preventDefault();
                        removeSeed(track, "track");
                    }}
                >
                    <img src={track.image} width={60} height={60} alt=""/>
                    <div className="tagName">
                        <span>
                            {track.name}
                        </span>
                    </div>
                </Tag>
            )}
        </Space>
    )

    const parametersMenu = <ParametersMenu
        values={
            {count, energy, popularity, danceability, tempo, acousticness, valence}
        }
        handlers={
            {setCount, setEnergy, setPopularity, setDanceability, setTempo, setAcousticness, setValence}
        }
    />

    if (error) {
        return (
            <ErrorScreen/>
        )
    }

    return (
        <div>
            <Navbar/>

            {playlist ? <Title style={{textAlign: "center"}} level={2}>Generated from: {playlist.name}</Title> : null}

            {/*<SearchOld addSeed={addSeed}/>*/}
            <SearchSeeds addSeed={addSeed}/>
            {seedTags}
            <Row>
                {/* Mobile settings drawer */}
                <Col xs={24} sm={24} md={24} lg={0} xl={0}>
                    { !loading && generatedPlaylistLink ?
                        <PlaylistSuccessPage link={generatedPlaylistLink}/> :
                        <SavePlaylist name={name} setName={setName} saveHandler={savePlaylist}/>
                    }
                    <Collapse bordered={false} className="collapse-parameters rounded-component">
                        <Panel header="Tune Playlist Settings" key="1">
                            {!loading && parametersMenu}
                        </Panel>
                    </Collapse>
                </Col>

                {/* Songs */}
                <Col
                    xs={24} sm={24} md={24} lg={16} xl={16}
                >
                    <SongList loading={loading} songs={songs}/>
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
                            {parametersMenu}
                        </div>
                        }
                    </Affix>

                </Col>
            </Row>
        </div>
    )
}