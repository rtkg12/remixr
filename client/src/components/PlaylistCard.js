import React from 'react'
import {Col, Card} from 'antd';
import {Link} from "react-router-dom";

const { Meta } = Card;

export default function PlaylistCard(props) {
    let image = <img
        style={{borderTopLeftRadius: '1em', borderTopRightRadius: '1em', marginTop: "-1px"}}
        src={props.playlist.image}
    />

    return (
        <Col className="gutter-row" xs={12} sm={8} md={6} lg={6} xl={6}>
            <Link to={{
                pathname: '/results',
                state: {
                    playlist: {
                        id: props.playlist.id,
                        name: props.playlist.name,
                        image: props.playlist.image
                    }
                }
            }}>
                <Card
                    hoverable
                    className="playlistCard"
                    cover={image}
                >
                    <Meta title={props.playlist.name} />
                </Card>
            </Link>
        </Col>
    )
}

