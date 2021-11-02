import React, { useEffect, useRef, useState } from 'react';
import { TwitterPicker } from 'react-color';
import { useDispatch, useSelector } from 'react-redux';
import { detectionContextStyle } from '../../utils/Constants';
import {
    getSelectedDetectionViewport,
    getSelectedDetectionClassName,
    addMissMatchedClassName,
    getSelectedDetectionWidthAndHeight,
    getSelectedDetectionType,
} from '../../redux/slices/detections/detectionsSlice';
import {
    getColorPickerVisible,
    getDetectionContextPosition,
    getZoomLevels,
} from '../../redux/slices/ui/uiSlice';
import * as constants from '../../utils/Constants';
import Utils from '../../utils/Utils';

const ColorPicker = () => {
    const isVisible = useSelector(getColorPickerVisible);
    const detectionContextPosition = useSelector(getDetectionContextPosition);
    const zoomLevels = useSelector(getZoomLevels);
    const selectedViewport = useSelector(getSelectedDetectionViewport);
    const widthAndHeight = useSelector(getSelectedDetectionWidthAndHeight);
    const selectedDetectionType = useSelector(getSelectedDetectionType);
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
                let menuOffset =
                    selectedDetectionType === 'binary'
                        ? 35
                        : selectedDetectionType === 'bounding'
                        ? 25
                        : 15;
                if (selectedViewport === constants.viewport.TOP) {
                    setContainerStyle({
                        position: 'absolute',
                        top:
                            detectionContextPosition.top +
                            zoomLevels.zoomLevelTop +
                            detectionContextStyle.HEIGHT +
                            10,
                        left:
                            detectionContextPosition.left +
                            zoomLevels.zoomLevelTop +
                            menuOffset,
                    });
                } else if (selectedViewport === constants.viewport.SIDE) {
                    setContainerStyle({
                        position: 'absolute',
                        top:
                            detectionContextPosition.top +
                            zoomLevels.zoomLevelSide +
                            detectionContextStyle.HEIGHT +
                            10,
                        left:
                            detectionContextPosition.left +
                            zoomLevels.zoomLevelSide +
                            menuOffset,
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
