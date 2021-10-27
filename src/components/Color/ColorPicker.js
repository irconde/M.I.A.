import React, { useEffect, useRef, useState } from 'react';
import { TwitterPicker } from 'react-color';
import { useDispatch, useSelector } from 'react-redux';
import {
    getSelectedDetectionViewport,
    getSelectedDetectionClassName,
    addMissMatchedClassName,
    getSelectedDetectionWidthAndHeight,
} from '../../redux/slices/detections/detectionsSlice';
import {
    getColorPickerVisible,
    getDetectionContextPosition,
    getZoomLevels,
} from '../../redux/slices/ui/uiSlice';
import * as constants from '../../utils/Constants';

const ColorPicker = () => {
    const isVisible = useSelector(getColorPickerVisible);
    const detectionContextPosition = useSelector(getDetectionContextPosition);
    const zoomLevels = useSelector(getZoomLevels);
    const selectedViewport = useSelector(getSelectedDetectionViewport);
    const widthAndHeight = useSelector(getSelectedDetectionWidthAndHeight);
    const usePrevious = (value) => {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    };
    const previousWidthAndHeight = usePrevious(widthAndHeight);
    const [containerStyle, setContainerStyle] = useState({});
    useEffect(() => {
        if (widthAndHeight !== null) {
            if (previousWidthAndHeight !== widthAndHeight) {
                // TODO: Derive formula to calculate scalar based on screen size and if possible pixel density
                if (selectedViewport === constants.viewport.TOP) {
                    setContainerStyle({
                        position: 'absolute',
                        top:
                            detectionContextPosition.top +
                            zoomLevels.zoomLevelTop +
                            widthAndHeight.height / 2.25,
                        left:
                            detectionContextPosition.left +
                            zoomLevels.zoomLevelTop +
                            widthAndHeight.height / 4,
                    });
                } else if (selectedViewport === constants.viewport.SIDE) {
                    setContainerStyle({
                        position: 'absolute',
                        top:
                            detectionContextPosition.top +
                            zoomLevels.zoomLevelSide +
                            widthAndHeight.height / 2,
                        left:
                            detectionContextPosition.left +
                            zoomLevels.zoomLevelSide +
                            widthAndHeight.height / 3.75,
                    });
                }
            }
        }
    });
    const selectedDetectionClassName = useSelector(
        getSelectedDetectionClassName
    );
    const dispatch = useDispatch();
    const [color, setColor] = useState();

    const colorChangeComplete = (color) => {
        setColor(color);
        dispatch(
            addMissMatchedClassName({
                className: selectedDetectionClassName,
                color: color.hex,
            })
        );
    };
    if (isVisible === true) {
        return (
            <div style={containerStyle}>
                <TwitterPicker
                    color={color}
                    onChangeComplete={(color) => colorChangeComplete(color)}
                    triangle="top-left"
                />
            </div>
        );
    } else {
        return null;
    }
};

export default ColorPicker;
