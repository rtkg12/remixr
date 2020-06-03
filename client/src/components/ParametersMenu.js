import React from 'react'
import { Slider, Typography } from 'antd';

const { Text } = Typography;

export default function ParametersMenu(props) {
    console.log("Rendered Parameters");
    console.log(props);
    const onChangeHandler = (value, handler) => {
        handler({
            min: value[0],
            max: value[1]
        })
    }

    return (
        <div>
            <div style={{}}>
                <Text>Popularity</Text>
                <Slider
                    range={true}
                    min={0}
                    max={100}
                    step={1}
                    defaultValue={[props.values.popularity.min, props.values.popularity.max]}
                    onAfterChange={(value) => onChangeHandler(value, props.handlers.setPopularity)}
                />

                <Text>Energy</Text>
                <Slider
                    range={true}
                    min={0}
                    max={1}
                    step={0.01}
                    defaultValue={[props.values.energy.min, props.values.energy.max]}
                    onAfterChange={(value) => onChangeHandler(value, props.handlers.setEnergy)}
                />

                <Text>Mood</Text>
                <Slider
                    range={true}
                    min={0}
                    max={1}
                    step={0.01}
                    defaultValue={[props.values.valence.min, props.values.valence.max]}
                    onAfterChange={(value) => onChangeHandler(value, props.handlers.setValence)}
                />

                <Text>Tempo</Text>
                <Slider
                    range={true}
                    min={50}
                    max={200}
                    step={1}
                    defaultValue={[props.values.tempo.min, props.values.tempo.max]}
                    onAfterChange={(value) => onChangeHandler(value, props.handlers.setTempo)}
                />

                <Text>Danceability</Text>
                <Slider
                    range={true}
                    min={0}
                    max={1}
                    step={0.01}
                    defaultValue={[props.values.danceability.min, props.values.danceability.max]}
                    onAfterChange={(value) => onChangeHandler(value, props.handlers.setDanceability)}
                />

                <Text>Acousticness</Text>
                <Slider
                    range={true}
                    min={0}
                    max={1}
                    step={0.01}
                    defaultValue={[props.values.acousticness.min, props.values.acousticness.max]}
                    onAfterChange={(value) => onChangeHandler(value, props.handlers.setAcousticness)}
                />
            </div>
        </div>
    )
}