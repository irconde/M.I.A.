import React, { useEffect, useState } from 'react';
import { TwitterPicker } from 'react-color';
import { useDispatch, useSelector } from 'react-redux';
import * as constants from '../../utils/enums/Constants';
import { detectionContextStyle } from '../../utils/enums/Constants';
import {
    addMissMatchedClassName,
    getSelectedDetectionClassName,
    getSelectedDetectionViewport,
    getSelectedDetectionWidthAndHeight,
} from '../../redux/slices/detections/detectionsSlice';
import {
    getColorPickerVisible,
    getDetectionContextPosition,
    getZoomLevels,
} from '../../redux/slices/ui/uiSlice';
import { ColorPickerContainer } from './color-picker.styles';

/**
 * Component within DetectionContextMenu component for editing colors of detection bounding box.
 *
 * @component
 */

const ColorPickerComponent = () => {
    const isVisible = useSelector(getColorPickerVisible);
    const detectionContextPosition = useSelector(getDetectionContextPosition);
    const zoomLevels = useSelector(getZoomLevels);
    const selectedViewport = useSelector(getSelectedDetectionViewport);
    const widthAndHeight = useSelector(getSelectedDetectionWidthAndHeight);
    const [topPosition, setTopPosition] = useState();
    const [leftPosition, setLeftPosition] = useState();
    useEffect(() => {
        if (widthAndHeight !== null) {
            const menuOffset = 37;
            if (selectedViewport === constants.viewport.TOP) {
                setTopPosition(
                    detectionContextPosition.top +
                        zoomLevels.zoomLevelTop +
                        detectionContextStyle.HEIGHT +
                        10
                );
                setLeftPosition(
                    detectionContextPosition.left +
                        zoomLevels.zoomLevelTop +
                        menuOffset
                );
            } else if (selectedViewport === constants.viewport.SIDE) {
                setTopPosition(
                    detectionContextPosition.top +
                        zoomLevels.zoomLevelSide +
                        detectionContextStyle.HEIGHT +
                        11
                );
                setLeftPosition(
                    detectionContextPosition.left +
                        zoomLevels.zoomLevelSide +
                        menuOffset
                );
            }
        }
    }, [widthAndHeight]);
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
            <ColorPickerContainer top={topPosition} left={leftPosition}>
                <TwitterPicker
                    color={color}
                    onChangeComplete={(color) => colorChangeComplete(color)}
                    triangle="top-left"
                />
            </ColorPickerContainer>
        );
    } else {
        return null;
    }
};

export default ColorPickerComponent;
