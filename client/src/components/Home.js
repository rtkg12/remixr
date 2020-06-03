import React, {useState} from 'react';
import {Button, Typography} from "antd";
import Cookies from 'js-cookie';
import {Link} from "react-router-dom";
import Footer from './Footer';

const { Text } = Typography;

function Home() {
    const [accessToken] = useState(Cookies.get('access_token'));

    let actionButton;
    if (accessToken) {
        actionButton = (
            <Link to="/playlists">
                <Button type="primary" shape="round" size="large" className="highlight">
                    Select from my playlists
                </Button>
            </Link>
        )
    } else {
        actionButton = (
            <a href={`${process.env.REACT_APP_API_URL}/login`}>
                <Button className="spotify-login" shape="round" size="large">
                    Login with Spotify
                </Button>
            </a>
        )
    }

    return (
        <div className="gradient">
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
