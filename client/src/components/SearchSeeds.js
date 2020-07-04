import React, {useState} from 'react';
import {AutoComplete, Input} from 'antd';
import {Redirect} from "react-router-dom";

import {search, extractArtistInfo, extractTrackInfo} from '../modules/Spotify';
import Cookies from "js-cookie";

const SearchSeeds = (props) => {
    const [accessToken] = useState(Cookies.get('access_token'));
    const [value, setValue] = useState('');
    const [tracks, setTracks] = useState([]);
    const [artists, setArtists] = useState([]);
    const [seed, setSeed] = useState(null);

    const searchSpotify = async (searchTerm) => {
        if (searchTerm && searchTerm.length > 0) {
            let response = await search(accessToken, searchTerm);
            let artists = response.body.artists.items;
            let tracks = response.body.tracks.items;

            artists = artists.map(extractArtistInfo);
            tracks = tracks.map(extractTrackInfo);

            setArtists(artists);
            setTracks(tracks);
        }
    }

    const renderTitle = title => (
        <span>
            {title}
         </span>
    );

    const renderItem = (item, type) => ({
        key: item.id,
        data: item,
        type,
        value: item.id,
        label: (
            <div>
                <img src={item.image} className="rounded" width="50" height="50" alt=""/>
                <span
                    style={{
                        marginLeft: "1em"
                    }}
                >
                    {item.name}
                </span>
            </div>
        )
    });

    const options = [
        {
            label: renderTitle('Tracks'),
            options: tracks && tracks.length > 0 ? tracks.map(track => renderItem(track, "track")) : [],
        },
        {
            label: renderTitle('Artists'),
            options: artists && artists.length > 0 ? artists.map(artist => renderItem(artist, "artist")) : [],
        }
    ];

    if (seed) {
        return <Redirect to={{
            pathname: '/results',
            state: { seed }
        }} />
    }

    return (
        <div>
            <AutoComplete
                style={{
                    marginBottom: "0.5em",
                    width: "100%",
                    borderRadius: "10px"
                }}
                dropdownClassName="certain-category-search-dropdown"
                options={options}
                value={value}
                onChange={(value) => {
                    searchSpotify(value);
                    setValue(value);
                }}
                onSelect={(value, option) =>
                        props && props.addSeed
                            ? (props.addSeed(option.data, option.type), setValue(""))
                            : option.type === "track"
                                ? setSeed({artists: [], tracks: [option.data]})
                                : setSeed({artists: [option.data], tracks: []})
                }
            >
                <Input
                    style={{
                        borderRadius: "10px"
                    }}
                    size="large"
                    placeholder={props.addSeed ? "Add or remove seeds" : "Discover based on artist/song"}
                />
            </AutoComplete>
        </div>
    );
};

export default SearchSeeds;
