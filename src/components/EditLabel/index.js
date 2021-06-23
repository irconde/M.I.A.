import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import LabelList from './LabelList';
import ArrowIcon from '../../icons/ArrowIcon';
import * as constants from '../../utils/Constants';
import Utils from '../../utils/Utils.js';
import { useSelector } from 'react-redux';
import { getDetectionContextInfo } from '../../redux/slices/ui/uiSlice';
import { getDetectionLabels } from '../../redux/slices/detections/detectionsSlice';

const EditLabelWrapper = styled.div`
    position: absolute;
    width: ${(props) => `${props.width}px`};
    min-width: 120px;
    z-index: 500;
    left: ${(props) => `${props.left - props.positionDiff}px`};
    top: ${(props) => `${props.top}px`};
    background: ${constants.colors.BLUE};

    .inputContainer {
        display: flex;
        justify-content: space-between;

        .newLabelInput {
            background-color: transparent;
            font-family: 'Arial';
            font-weight: '600px';
            font-size: ${(props) => `${props.fontSize}px`};
            height: ${(props) => `${props.heightDiff}px`};
            color: ${constants.colors.WHITE};
            border: none;
            border-radius: 4px;
            user-select: none;
            width: 100%;
            &:disabled {
                background-color: rgba(0, 0, 0, 0.35);
            }
            &:focus {
                border-color: ${constants.colors.BLUE};
                outline: 0;
                box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
                    0 0 8px rgba(102, 175, 233, 0.6);
            }
            &::placeholder {
                color: ${constants.colors.WHITE};
            }
        }
    }
`;

/**
 * Widget for editing a selected detection's label.
 * Contains text input box and list of existing labels.
 * List of labels is visible when toggled by arrow button.
 * @param {function} onLabelChange Function to call when new label is created
 */
const EditLabel = ({ onLabelChange }) => {
    const reduxInfo = useSelector(getDetectionContextInfo);
    const {
        zoomSide,
        zoomTop,
        viewport,
        position,
        width,
        font,
        isVisible,
    } = reduxInfo;
    const labels = useSelector(getDetectionLabels);
    const [isListOpen, setIsListOpen] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const inputField = useRef(null);

    const placeholder = 'Input text';
    const arrowOrientation = {
        UP: 'up',
        DOWN: 'down',
    };

    // Clear input field when list is opened
    useEffect(() => {
        if (isListOpen) {
            setNewLabel('');
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
            setNewLabel('');
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
                <div className="inputContainer">
                    <input
                        className="newLabelInput"
                        placeholder={isListOpen ? '' : placeholder}
                        value={newLabel}
                        onChange={(e) =>
                            setNewLabel(e.target.value.toUpperCase())
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
                </div>
                {isListOpen && (
                    <LabelList
                        width={width}
                        labels={labels}
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

EditLabel.propTypes = {
    onLabelChange: PropTypes.func.isRequired,
};
export default EditLabel;
