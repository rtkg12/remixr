import React, {useEffect, useState} from 'react';
import Autosuggest from 'react-autosuggest';
import {Redirect} from "react-router-dom";

import {search, extractArtistInfo, extractTrackInfo} from '../modules/Spotify';
import Cookies from "js-cookie";

const SearchOld = (props) => {
    const [accessToken] = useState(Cookies.get('access_token'));
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState([
        {
            title: "Tracks",
            suggestions: []
        },
        {
            title: "Artists",
            suggestions: []
        }
    ]);
    const [seed, setSeed] = useState(null);

    const searchSpotify = async (searchTerm) => {
        let response = await search(accessToken, searchTerm);
        let artists = response.body.artists.items;
        let tracks = response.body.tracks.items;

        artists = artists.map(extractArtistInfo);
        tracks = tracks.map(extractTrackInfo);

        setSuggestions([
            {
                title: "Tracks",
                suggestions: tracks
            },
            {
                title: "Artists",
                suggestions: artists
            }
        ]);
    }

    const renderTitle = item => (
        <div>
            <img src={item.image} width={60} height={60}/>
            <span>
                {item.name}
            </span>
        </div>
    );

    if (seed) {
        return <Redirect to={{
            pathname: '/results',
            state: { seed }
        }} />
    }

    return (
        <div>
            <Autosuggest
                alwaysRenderSuggestions={true}
                multiSection={true}
                suggestions={suggestions}
                onSuggestionsFetchRequested={({value}) => searchSpotify(value)}
                onSuggestionsClearRequested={() => {
                    setSuggestions([
                        {
                            title: "Tracks",
                            suggestions: []
                        },
                        {
                            title: "Artists",
                            suggestions: []
                        }
                    ]);
                }}
                getSuggestionValue={(suggestion) => suggestion.name}
                renderSuggestion={renderTitle}
                renderSectionTitle={(section) => <strong>{section.title}</strong>}
                getSectionSuggestions={(section) => section.suggestions}
                inputProps={{
                    placeholder: "SearchOld",
                    value,
                    onChange: (event, { newValue, method }) => setValue(newValue)
                }}
                onSuggestionSelected={(event, suggestion) =>
                    props && props.addSeed
                        ? suggestion.sectionIndex === 0
                        ? props.addSeed(null, suggestion.suggestion)
                        : props.addSeed(suggestion.suggestion, null)
                        : suggestion.sectionIndex === 0
                        ? setSeed({artists: [], tracks: [suggestion.suggestion]})
                        : setSeed({artists: [suggestion.suggestion], tracks: []})
                }
            />
        </div>
    );
};

export default SearchOld;
