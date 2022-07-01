import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ArrowIcon from '../../icons/ArrowIcon';
import * as constants from '../../utils/Constants';
import Utils from '../../utils/Utils.js';
import { useDispatch, useSelector } from 'react-redux';
import {
    getDetectionContextInfo,
    getInputLabel,
    setInputLabel,
} from '../../redux/slices/ui/uiSlice';
import { getDetectionLabels } from '../../redux/slices/detections/detectionsSlice';
import { 
    EditLabelWrapper, 
    InputContainer, 
    NewLabelInput,
} from './index.styles';
import LabelListComponent from './label-list.component';

/**
 * Widget for editing a selected detection's label.
 * Contains text input box and list of existing labels.
 * List of labels is visible when toggled by arrow button.
 * @param {function} onLabelChange Function to call when new label is created
 */
const EditLabelComponent = ({ onLabelChange }) => {
    const dispatch = useDispatch();
    const reduxInfo = useSelector(getDetectionContextInfo);
    const { zoomSide, zoomTop, viewport, position, width, font, isVisible } =
        reduxInfo;
    const labels = useSelector(getDetectionLabels);
    const [isListOpen, setIsListOpen] = useState(false);
    const newLabel = useSelector(getInputLabel);
    const inputField = useRef(null);

    const formattedLabels = labels.filter((label) => label !== 'unknown');

    const placeholder = 'Input text';
    const arrowOrientation = {
        UP: 'up',
        DOWN: 'down',
    };

    // Clear input field when list is opened
    useEffect(() => {
        if (isListOpen) {
            dispatch(setInputLabel(''));
        }
    }, [isListOpen]);
    useEffect(() => {
        // When component is updated to be visible or the label list is closed, focus the text input field for user input
        if (isVisible && !isListOpen) {
            inputField.current.focus();
        }

        // Reset label list visibility when component is hidden
        if (!isVisible) {
            setIsListOpen(false);
        }
    }, [isVisible, isListOpen]);

    /**
     * Select new label from list of existing detection labels
     * @param {string} label New label passed up from `LabelList` component
     */
    const submitFromList = (label) => {
        onLabelChange(label);
        setIsListOpen(false);
    };
    /**
     * Called on every keydown in label input field.
     * If `Enter` is pressed, submit the new label using the stored value in state,
     * which is updated `onChange` in the input field
     * @param {KeyboardEvent} e event fired for every key press
     */
    const submitFromInput = (e) => {
        if (e.key === 'Enter') {
            onLabelChange(
                Utils.truncateString(newLabel, constants.MAX_LABEL_LENGTH)
            );
            dispatch(setInputLabel(''));
        }
    };

    const getEditLabelDiff = (diff, viewport) => {
        const zoom = viewport === 'side' ? zoomSide : zoomTop;
        return diff * zoom;
    };

    if (isVisible) {
        return (
            <EditLabelWrapper
                viewport={viewport}
                positionDiff={getEditLabelDiff(1, viewport)}
                heightDiff={
                    getEditLabelDiff(18, viewport) < 28
                        ? 28
                        : getEditLabelDiff(18, viewport)
                }
                top={position.top}
                left={position.left}
                width={width}
                fontSize={getFontSize(font)}>
                <InputContainer>
                    <NewLabelInput
                        placeholder={isListOpen ? '' : placeholder}
                        value={newLabel}
                        onChange={(e) =>
                            dispatch(
                                setInputLabel(e.target.value.toUpperCase())
                            )
                        }
                        onKeyDown={submitFromInput}
                        disabled={isListOpen}
                        ref={inputField}
                    />
                    <ArrowIcon
                        handleClick={() => {
                            setIsListOpen(!isListOpen);
                        }}
                        direction={
                            isListOpen
                                ? arrowOrientation.UP
                                : arrowOrientation.DOWN
                        }
                        color={constants.colors.WHITE}
                    />
                </InputContainer>
                {isListOpen && (
                    <LabelListComponent
                        width={width}
                        labels={formattedLabels}
                        onLabelSelect={submitFromList}
                    />
                )}
            </EditLabelWrapper>
        );
    } else return null;
};

function getFontSize(str) {
    var fontArr = str.split(' ');
    let floatNum = parseFloat(fontArr[1]);
    Math.floor(floatNum);
    let fontSize = parseInt(floatNum);
    return fontSize <= 14 ? 14 : fontSize; // keeps font from getting too small
}

EditLabelComponent.propTypes = {
    onLabelChange: PropTypes.func.isRequired,
};
export default EditLabelComponent;
