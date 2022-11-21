import React from 'react';
import { Slider, Typography } from 'antd';
import ReactGA from 'react-ga';

const { Text } = Typography;

const ParametersMenu = (props: {
  handlers: {
    setCount: React.Dispatch<React.SetStateAction<number>>;
    setPopularity: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
    setEnergy: React.Dispatch<
      React.SetStateAction<{
        min: number;
        max: number;
      }>
    >;
    setValence: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
    setTempo: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
    setDanceability: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
    setAcousticness: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
  };
  values: {
    count: number | undefined;
    popularity: { min: number; max: number };
    energy: { min: number; max: number };
    valence: { min: number; max: number };
    tempo: { min: number; max: number };
    danceability: { min: number; max: number };
    acousticness: { min: number; max: number };
  };
}) => {
  const onChangeHandler = (
    value: number[],
    handler: ({ min, max }: { min: number; max: number }) => void,
    attribute: string
  ) => {
    ReactGA.event({
      category: 'Parameters',
      action: 'Changed parameters',
      label: attribute,
      value: value[1] - value[0],
    });

    handler({
      min: value[0],
      max: value[1],
    });
  };

  const setCount = (value: number) => {
    ReactGA.event({
      category: 'Parameters',
      action: 'Changed parameters',
      label: 'count',
      value: value,
    });

    props.handlers.setCount(value);
  };

  return (
    <div>
      <div style={{}}>
        <Text>Number of songs</Text>
        <Slider min={10} max={100} defaultValue={props.values.count} onAfterChange={setCount} step={5} />

        <Text>Popularity</Text>
        <Slider
          range={true}
          min={0}
          max={100}
          step={1}
          defaultValue={[props.values.popularity.min, props.values.popularity.max]}
          onAfterChange={value => onChangeHandler(value, props.handlers.setPopularity, 'popularity')}
        />

        <Text>Energy</Text>
        <Slider
          range={true}
          min={0}
          max={1}
          step={0.01}
          defaultValue={[props.values.energy.min, props.values.energy.max]}
          onAfterChange={value => onChangeHandler(value, props.handlers.setEnergy, 'energy')}
        />

        <Text>Mood</Text>
        <Slider
          range={true}
          min={0}
          max={1}
          step={0.01}
          defaultValue={[props.values.valence.min, props.values.valence.max]}
          onAfterChange={value => onChangeHandler(value, props.handlers.setValence, 'valence')}
        />

        <Text>Tempo</Text>
        <Slider
          range={true}
          min={50}
          max={200}
          step={1}
          defaultValue={[props.values.tempo.min, props.values.tempo.max]}
          onAfterChange={value => onChangeHandler(value, props.handlers.setTempo, 'tempo')}
        />

        <Text>Danceability</Text>
        <Slider
          range={true}
          min={0}
          max={1}
          step={0.01}
          defaultValue={[props.values.danceability.min, props.values.danceability.max]}
          onAfterChange={value => onChangeHandler(value, props.handlers.setDanceability, 'danceability')}
        />

        <Text>Acousticness</Text>
        <Slider
          range={true}
          min={0}
          max={1}
          step={0.01}
          defaultValue={[props.values.acousticness.min, props.values.acousticness.max]}
          onAfterChange={value => onChangeHandler(value, props.handlers.setAcousticness, 'acousticness')}
        />
      </div>
    </div>
  );
};

export default ParametersMenu;
