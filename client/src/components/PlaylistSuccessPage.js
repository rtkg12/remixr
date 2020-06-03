import React from 'react'
import { Result, Button } from 'antd';


export default function PlaylistSuccessPage(props) {
    return (
        <Result
            className="rounded-component"
            style={{
                padding: 0,
                paddingTop: "1em",
                paddingBottom: "1em",
                textAlign: 'center'
            }}
            status="success"
            title="Playlist created!"
            extra={[
                <Button type="primary" shape="round" size="large" key="spotifyLink">
                    <a href={props.link}>
                        View on Spotify
                    </a>
                </Button>,
            ]}
        />
    )
}

