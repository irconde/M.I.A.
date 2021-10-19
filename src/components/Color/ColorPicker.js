import React, { useState } from 'react';
import { TwitterPicker } from 'react-color';
import { useDispatch, useSelector } from 'react-redux';
import {
    getSelectedDetectionViewport,
    getSelectedDetectionClassName,
} from '../../redux/slices/detections/detectionsSlice';
import { addMissMatchedClassName } from '../../redux/slices/settings/settingsSlice';
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
    const selectedDetectionClassName = useSelector(
        getSelectedDetectionClassName
    );
    const dispatch = useDispatch();
    const [color, setColor] = useState();
    // TODO: implement accurate positioning, current is prototype and needs the viewport too
    const containerStyle = {
        position: 'absolute',
        top: detectionContextPosition.top + zoomLevels.zoomLevelTop * 20,
        left: detectionContextPosition.left + zoomLevels.zoomLevelTop * 15,
    };
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
                    styles={{
                        card: {
                            width: '276px',
                            background: '#fff',
                            border: '0 solid rgba(0,0,0,0.25)',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                            borderRadius: '4px',
                            position: 'relative',
                        },
                    }}
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
