import React, {useEffect, useState} from 'react';
import {Button, Typography } from "antd";
import Cookies from 'js-cookie';
import {Link} from "react-router-dom";
import Footer from './Footer';
import SearchSeeds from './SearchSeeds';
import axios from "axios";
import ReactGA from "react-ga";

const { Text } = Typography;

const transport = axios.create({
    withCredentials: true
});

function Home() {
    const [accessToken, setAccessToken] = useState(Cookies.get('access_token'));
    const [refreshToken, setRefreshToken] = useState(Cookies.get('refresh_token'));

    useEffect(() => {
        ReactGA.pageview("/");
    }, [])

    const refresh = async () => {
        try {
            const url = process.env.REACT_APP_API_URL + "/refresh";
            let response = await transport.get(url);
            let expiry_time = new Date(new Date().getTime() + response.data.maxAge);
            Cookies.set('access_token', response.data.access_token, {expires: expiry_time});
            setAccessToken(response.data.access_token);
            ReactGA.event({
                category: "Auth",
                action: "Refreshed auth token",
                label: "Home Page"
            });
        } catch (e) {
            setAccessToken(null);
            setRefreshToken(null);
        }
    }

    const logout = () => {
        ReactGA.event({
            category: "Auth",
            action: "Log out button pressed",
            label: "Home Page"
        });
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('userID');
        setAccessToken(null);
        setRefreshToken(null);
    }

    let actionButton;
    if (accessToken) {
        actionButton = (
            <div>
                <div
                    className="searchBox"
                    style={{
                        align: "center",
                        margin: "0 auto"
                    }}
                >
                    <SearchSeeds />
                </div>
                <Link to="/playlists">
                    <Button
                        type="primary"
                        shape="round"
                        size="large"
                        className="highlight"
                        style={{marginTop: "0.5em"}}
                        onClick={() => {
                            ReactGA.event({
                                category: "Playlist",
                                action: "Click on playlist button",
                                label: "Home page"
                            });
                        }}
                        >
                        Select from my playlists
                    </Button>
                </Link>
            </div>
        )
    } else if (refreshToken) {
        refresh();
    } else {
        actionButton = (
            <a
                href={`${process.env.REACT_APP_API_URL}/login`}
                onClick={() => {
                    ReactGA.event({
                        category: "Auth",
                        action: "Log in button pressed",
                        label: "Home Page"
                    });
                }}>
                <Button className="spotify-login" shape="round" size="large" >
                    Login with Spotify
                </Button>
            </a>
        )
    }

    return (
        <div className="gradient">
            {accessToken
                ? <Button
                    shape="round"
                    size="large"
                    style={{
                        position: 'absolute',
                        right: '5%',
                        marginTop: "1.5em",
                        background: "#68EB64",
                        borderColor: "#68EB64",
                        color: "#262626"
                    }}
                    onClick={logout}
                >
                    Log out
                </Button>
                : null
            }

            <div className="home center">
                <h1 className="title"> remixr </h1>
                <Text className="subtitle"> Discover new music based on playlists you love! </Text>
                {actionButton}
            </div>

        <Footer/>
        </div>
    );
}

export default Home;
