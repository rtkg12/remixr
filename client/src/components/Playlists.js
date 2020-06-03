import React, {useEffect, useState} from 'react';
import {Link, Redirect} from "react-router-dom";
import {Divider, Input, Row, Col, Card, Typography, Skeleton, AutoComplete} from 'antd';
import Cookies from 'js-cookie';
import axios from 'axios';
import Navbar from "./Navbar";
import ErrorScreen from "./ErrorScreen";
import PlaylistCard from "./PlaylistCard";

const { Meta } = Card;
const { Title } = Typography;


const transport = axios.create({
    withCredentials: true
});

export default function Playlist() {
    const [accessToken] = useState(Cookies.get('access_token'));
    const [playlists, setPlaylists] = useState([]);
    const [filteredPlaylists, setFilteredPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let url = process.env.REACT_APP_API_URL + "/playlists";

        transport.get(url).then(response => {
            setPlaylists(response.data.playlists);
            setFilteredPlaylists(response.data.playlists);
            setLoading(false);
        }, (error) => {
            setError(true);
        });
    }, []);

    if (!accessToken) {
        return <Redirect to="/"/>
    }

    const filter = (searchTerm) => {
        setFilteredPlaylists(playlists.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())));
    }

    if (error) {
        return (
            <ErrorScreen/>
        )
    }

    return (
        <div className="playlists">
            <Navbar/>

            <Title> Select playlist </Title>

            <AutoComplete
                className="searchBox"
                onSearch={filter}
            >
                <Input className="rounded" size="large" placeholder="Filter Playlists"/>
            </AutoComplete>

            <Divider />

            <div>
                <Row gutter={[16, 24]}>
                    {loading && <Skeleton active />}
                    {filteredPlaylists && filteredPlaylists.map(item => {
                        return (
                            <PlaylistCard playlist={item}/>
                        )
                    })}
                </Row>
            </div>
        </div>
    )
}