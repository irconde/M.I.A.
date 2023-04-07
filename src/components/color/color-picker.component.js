import React, { useState } from 'react';
import { TwitterPicker } from 'react-color';
import { useDispatch, useSelector } from 'react-redux';
import { ColorPickerContainer } from './color-picker.styles';
import {
    getColorPickerVisible,
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
    const selectedAnnotation = useSelector(getSelectedAnnotation);
    const dispatch = useDispatch();
    const [color, setColor] = useState();

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
    return (
        isVisible && (
            <ColorPickerContainer>
                <TwitterPicker
                    color={color}
                    onChangeComplete={(color) => colorChangeComplete(color)}
                    triangle="top-left"
                />
            </ColorPickerContainer>
        )
    );
};

export default ColorPickerComponent;
