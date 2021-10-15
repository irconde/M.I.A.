import React, { useState } from 'react';
import { TwitterPicker } from 'react-color';
import { useSelector } from 'react-redux';
import { getSelectedDetectionViewport } from '../../redux/slices/detections/detectionsSlice';
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
    const [color, setColor] = useState();
    const containerStyle = {
        position: 'absolute',
        top: detectionContextPosition.top + zoomLevels.zoomLevelTop * 20,
        left: detectionContextPosition.left + zoomLevels.zoomLevelTop * 15,
    };
    if (isVisible === true) {
        return (
            <div style={containerStyle}>
                <TwitterPicker
                    color={color}
                    styles={{ backgroundColor: 'black' }}
                    onChangeComplete={(color) => setColor(color)}
                    triangle="top-left"
                />
            </div>
        );
    } else {
        return null;
    }
};

export default ColorPicker;
