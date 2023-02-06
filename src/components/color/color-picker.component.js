import React, { useEffect, useState } from 'react';
import { TwitterPicker } from 'react-color';
import { useDispatch, useSelector } from 'react-redux';
import { detectionContextStyle } from '../../utils/enums/Constants';
import { ColorPickerContainer } from './color-picker.styles';
import {
    getAnnotationContextPosition,
    getColorPickerVisible,
    getZoomLevel,
    updateAnnotationContextVisibility,
    updateColorPickerVisibility,
} from '../../redux/slices/ui.slice';
import {
    getSelectedAnnotation,
    saveColorsFile,
    updateAnnotationColor,
} from '../../redux/slices/annotation.slice';
import Utils from '../../utils/general/Utils';

/**
 * Component within DetectionContextMenu component for editing colors of detection bounding box.
 *
 * @component
 */

const ColorPickerComponent = () => {
    const isVisible = useSelector(getColorPickerVisible);
    const annotationContextPosition = useSelector(getAnnotationContextPosition);
    const zoomLevel = useSelector(getZoomLevel);
    const selectedAnnotation = useSelector(getSelectedAnnotation);
    const [topPosition, setTopPosition] = useState();
    const [leftPosition, setLeftPosition] = useState();
    const dispatch = useDispatch();
    const [color, setColor] = useState();

    useEffect(() => {
        if (selectedAnnotation !== null) {
            const menuOffset = 37;
            setTopPosition(
                annotationContextPosition.top +
                    zoomLevel +
                    detectionContextStyle.HEIGHT +
                    10
            );
            setLeftPosition(
                annotationContextPosition.left + zoomLevel + menuOffset
            );
        }
    }, [selectedAnnotation]);

    const colorChangeComplete = (color) => {
        const newColor = {
            categoryName: selectedAnnotation.categoryName,
            color: color.hex,
        };
        setColor(color);
        dispatch(updateColorPickerVisibility(false));
        dispatch(updateAnnotationContextVisibility(true));
        dispatch(saveColorsFile(newColor));
        Utils.dispatchAndUpdateImage(dispatch, updateAnnotationColor, newColor);
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
