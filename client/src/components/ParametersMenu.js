import React from 'react';
import { Slider, Typography } from 'antd';
import ReactGA from 'react-ga';

// Import Icon SVGs
import { ReactComponent as IconAcousticHigh } from '../assets/icons/icon-acoustic-high.svg';
import { ReactComponent as IconAcousticLow } from '../assets/icons/icon-acoustic-low.svg';
import { ReactComponent as IconDanceabilityLow } from '../assets/icons/icon-danceability-low.svg';
import { ReactComponent as IconDanceabilityHigh } from '../assets/icons/icon-danceability-high.svg';
import { ReactComponent as IconEnergyLow } from '../assets/icons/icon-energy-low.svg';
import { ReactComponent as IconEnergyHigh } from '../assets/icons/icon-energy-high.svg';
import { ReactComponent as IconMoodLow } from '../assets/icons/icon-mood-low.svg';
import { ReactComponent as IconMoodHigh } from '../assets/icons/icon-mood-high.svg';
import { ReactComponent as IconPopularityLow } from '../assets/icons/icon-popularity-low.svg';
import { ReactComponent as IconPopularityHigh } from '../assets/icons/icon-popularity-high.svg';
import { ReactComponent as IconSizeLow } from '../assets/icons/icon-size-low.svg';
import { ReactComponent as IconSizeHigh } from '../assets/icons/icon-size-high.svg';
import { ReactComponent as IconSpeed } from '../assets/icons/icon-speed.svg';

const { Text } = Typography;

export default function ParametersMenu(props) {
  const onChangeHandler = (value, handler, attribute) => {
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

  const setCount = value => {
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
        <div className="slider-group">
          <IconSizeLow className="slider-icon low" />
          <Slider
            className="slider"
            min={10}
            max={100}
            defaultValue={props.values.count}
            onAfterChange={setCount}
            step={5}
          />
          <IconSizeHigh className="slider-icon high" />
        </div>

        <Text>Popularity</Text>
        <div className="slider-group">
          <IconPopularityLow className="slider-icon low" />
          <Slider
            className="slider"
            range={true}
            min={0}
            max={100}
            step={1}
            defaultValue={[props.values.popularity.min, props.values.popularity.max]}
            onAfterChange={value => onChangeHandler(value, props.handlers.setPopularity, 'popularity')}
          />
          <IconPopularityHigh className="slider-icon high" />
        </div>

        <Text>Energy</Text>
        <div className="slider-group">
          <IconEnergyLow className="slider-icon low" />
          <Slider
            className="slider"
            range={true}
            min={0}
            max={1}
            step={0.01}
            defaultValue={[props.values.energy.min, props.values.energy.max]}
            onAfterChange={value => onChangeHandler(value, props.handlers.setEnergy, 'energy')}
          />
          <IconEnergyHigh className="slider-icon high" />
        </div>

        <Text>Mood</Text>
        <div className="slider-group">
          <IconMoodLow className="slider-icon low" />
          <Slider
            className="slider"
            range={true}
            min={0}
            max={1}
            step={0.01}
            defaultValue={[props.values.valence.min, props.values.valence.max]}
            onAfterChange={value => onChangeHandler(value, props.handlers.setValence, 'valence')}
          />
          <IconMoodHigh className="slider-icon high" />
        </div>

        <Text>Tempo</Text>
        <div className="slider-group">
          <IconSpeed className="slider-icon low" />
          <Slider
            className="slider"
            range={true}
            min={50}
            max={200}
            step={1}
            defaultValue={[props.values.tempo.min, props.values.tempo.max]}
            onAfterChange={value => onChangeHandler(value, props.handlers.setTempo, 'tempo')}
          />
          <IconSpeed className="slider-icon high" />
        </div>

        <Text>Danceability</Text>
        <div className="slider-group">
          <IconDanceabilityLow className="slider-icon low" />
          <Slider
            className="slider"
            range={true}
            min={0}
            max={1}
            step={0.01}
            defaultValue={[props.values.danceability.min, props.values.danceability.max]}
            onAfterChange={value => onChangeHandler(value, props.handlers.setDanceability, 'danceability')}
          />
          <IconDanceabilityHigh className="slider-icon high" />
        </div>

        <Text>Acousticness</Text>
        <div className="slider-group">
          <IconAcousticLow className="slider-icon low" />
          <Slider
            className="slider"
            range={true}
            min={0}
            max={1}
            step={0.01}
            defaultValue={[props.values.acousticness.min, props.values.acousticness.max]}
            onAfterChange={value => onChangeHandler(value, props.handlers.setAcousticness, 'acousticness')}
          />
          <IconAcousticHigh className="slider-icon high" />
        </div>
      </div>
    </div>
  );
}
