import React, {useEffect, useState} from 'react';
import Vibrant from 'node-vibrant';
import {Col, Card, Spin} from 'antd';
import {Link} from "react-router-dom";

const { Meta } = Card;

const DEFAULT_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Simple_Music.svg/1024px-Simple_Music.svg.png";

export default function PlaylistCard(props) {
    const imageURL = props.playlist.image && props.playlist.image !== ""
        ? props.playlist.image
        : DEFAULT_IMAGE;

    let image =
            <img
                style={{
                    borderTopLeftRadius: '1em',
                    borderTopRightRadius: '1em',
                    marginTop: "-1px",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "cover"
                }}
                src={imageURL}
                alt=""
            />


    return (
        <Col className="gutter-row" xs={12} sm={8} md={6} lg={6} xl={6}>
            <Link to={{
                pathname: '/results',
                state: {
                    playlist: {
                        id: props.playlist.id,
                        name: props.playlist.name,
                        image: imageURL
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

