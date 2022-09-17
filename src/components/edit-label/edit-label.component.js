import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ArrowIcon from '../../icons/shared/arrow-icon/arrow.icon';
import * as constants from '../../utils/enums/Constants';
import Utils from '../../utils/general/Utils.js';
import { useDispatch, useSelector } from 'react-redux';
import {
    getDetectionContextInfo,
    getInputLabel,
    getRecentScroll,
    setInputLabel,
} from '../../redux/slices/ui/uiSlice';
import {
    getDetectionLabels,
    getSelectedDetection,
} from '../../redux/slices/detections/detectionsSlice';
import {
    ArrowIconWrapper,
    ClearIconWrapper,
    EditLabelWrapper, INPUT_HEIGHT,
    InputContainer,
    NewLabelInput,
} from './edit-label.styles';
import LabelListComponent from './label-list.component';
import ClearIcon from '../../icons/edit-label/clear-icon/clear.icon';

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
    const recentScroll = useSelector(getRecentScroll);
    const newLabel = useSelector(getInputLabel);
    const selectedDetection = useSelector(getSelectedDetection);
    const inputField = useRef(null);
    const [isListOpen, setIsListOpen] = useState(false);
    const [showClearIcon, setShowClearIcon] = useState(false);

    const formattedLabels = labels.filter((label) => label !== 'unknown');

    const placeholder = 'Input text';

    // Clear input field when list is opened
    useEffect(() => {
        if (isListOpen) {
            setShowClearIcon(false);
        }
    }, [isListOpen]);
    useEffect(() => {
        // When component is updated to be visible or the label list is closed, focus the text input field for user input
        if (isVisible && !isListOpen) {
            inputField.current.focus();
            setShowClearIcon(true);
            // set the value of the text input to the current detection class name
            if (inputField.current.value === '') {
                const currentClassName =
                    selectedDetection.className.toUpperCase();
                dispatch(setInputLabel(currentClassName));
            }
        }

        // Reset label list visibility when component is hidden
        if (!isVisible) {
            setIsListOpen(false);
            setShowClearIcon(false);
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
        if (e.key === 'Enter' && e.target.value !== '') {
            onLabelChange(
                Utils.truncateString(newLabel, constants.MAX_LABEL_LENGTH)
            );
            dispatch(setInputLabel(''));
        }
    };

    /**
     * Scales a value based on the given viewport's zoom level
     * @param {number} value
     * @param {string} viewport
     * @returns {number}
     */
    const scaleByZoom = (value, viewport) => {
        return value * getViewportZoom(viewport);
    };

    /**
     * Calculate the font size based on the given string
     * @param {string} str
     * @returns {number} fontSize
     */
    const getFontSize = (str) => {
        var fontArr = str.split(' ');
        let floatNum = parseFloat(fontArr[1]);
        Math.floor(floatNum);
        let fontSize = parseInt(floatNum);
        return fontSize <= 14 ? 14 : fontSize; // keeps font from getting too small
    };

    /**
     * Triggered when the edit label input field is changed. Shows and hides the clear icon
     *
     * @param {Event} e - change event object
     */
    const handleLabelInputChange = (e) => {
        const { value } = e.target;
        setShowClearIcon(!!value.length);
        dispatch(setInputLabel(value.toUpperCase()));
    };

    /**
     * Returns the appropriate zoom amount based on the viewport (side or top)
     *
     * @param {string} viewport
     * @returns {number}
     */
    const getViewportZoom = (viewport) =>
        viewport === 'side' ? zoomSide : zoomTop;

    /**
     * Scales the given width by the zoom level and account for the detection border width
     *
     * @param {number} width
     * @param {string} viewport
     * @returns {number}
     */
    const getWidth = (width, viewport) => {
        const { BORDER_WIDTH } = constants.detectionStyle;
        return (
            scaleByZoom(width, viewport) + scaleByZoom(BORDER_WIDTH, viewport)
        );
    };

    if (isVisible && !recentScroll) {
        return (
            <EditLabelWrapper
                viewport={viewport}
                top={position.top - INPUT_HEIGHT}
                left={position.left - getViewportZoom(viewport)}
                width={getWidth(width, viewport)}
                fontSize={getFontSize(font)}>
                <InputContainer>
                    <InputContainer>
                        <NewLabelInput
                            placeholder={isListOpen ? '' : placeholder}
                            value={isListOpen ? '' : newLabel}
                            onChange={handleLabelInputChange}
                            onKeyDown={submitFromInput}
                            disabled={isListOpen}
                            ref={inputField}
                        />
                        {showClearIcon && (
                            <ClearIconWrapper
                                onClick={() => {
                                    setShowClearIcon(false);
                                    inputField.current.focus();
                                    dispatch(setInputLabel(''));
                                }}>
                                <ClearIcon
                                    width={'20px'}
                                    height={'20px'}
                                    color={'white'}
                                />
                            </ClearIconWrapper>
                        )}
                    </InputContainer>
                    <ArrowIconWrapper
                        onClick={() => {
                            setIsListOpen(!isListOpen);
                        }}>
                        <ArrowIcon
                            direction={isListOpen ? 'up' : 'down'}
                            height="24px"
                            width="24px"
                            color={'white'}
                        />
                    </ArrowIconWrapper>
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

EditLabelComponent.propTypes = {
    onLabelChange: PropTypes.func.isRequired,
};
export default EditLabelComponent;
