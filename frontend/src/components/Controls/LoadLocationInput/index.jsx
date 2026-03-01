import {useEffect} from "react"

import RangeInput from "../RangeInput";

export default function LoadLocationInput({
    loadLocation,
    setLoadLocation,
    length,
    height,
    loadEdge
})
{
    const min = 0;
    const step = 1;

    const isVertical = loadEdge === "right" || loadEdge === "left";
    const max = isVertical ? height : length;
    const positionVariable = isVertical ? "y" : "x";

    useEffect(() => {
        setLoadLocation(max / 2.0)
    }, [loadEdge, setLoadLocation, max]);

    return (
        <RangeInput
            htmlFor={"load-location"}
            labelName={`Load Location (${positionVariable})`}
            value={loadLocation}
            min={min}
            max={max}
            step={step}
            handleChange={setLoadLocation}
        />
    )
}