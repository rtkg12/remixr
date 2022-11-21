import React from 'react';
import { Tag } from 'antd';

const SeedTag = (props: { image?: string; name: string }) => {
  return (
    <Tag closable style={{ paddingLeft: 0 }} icon={<img src={props.image} width={60} />}>
      <span style={{ padding: '1em' }}>{props.name}</span>
    </Tag>
  );
};

export default SeedTag;
