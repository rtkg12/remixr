import React, {useEffect, useState} from 'react'
import { Tag } from 'antd';

export default function SeedTag(props) {
    return (
        <Tag
            closable
            style={{paddingLeft: 0}}
            icon={
                <img src={props.image} width={60}/>
            }
        >
            <span style={ {padding: '1em'} }>
                {props.name}
            </span>
        </Tag>
    )
}

