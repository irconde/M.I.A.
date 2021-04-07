import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import LabelList from './LabelList';
import ArrowIcon from '../../icons/ArrowIcon';
import * as constants from '../../Constants';

const EditLabelWrapper = styled.div`
    position: absolute;
    width: ${(props) => `${props.width}px`};
    min-width: 120px;
    z-index: 500;
    left: ${(props) => `${props.left}px`};
    top: ${(props) => `${props.top}px`};
    background: ${constants.colors.BLUE};

    .inputContainer {
        display: flex;
        justify-content: space-between;

        .newLabelInput {
            background-color: transparent;
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
 * @param {boolean} isVisible Determines whether widget should be displayed on screen
 * @param {object} position Contains `top` and `left` properties to position widget
 * @param {number} width Width in pixels of selected detection
 * @param {Array<string>} labels list of existing labels for other detections
 * @param {function} onLabelChange Function to call when new label is created
 */
const EditLabel = ({ isVisible, position, width, labels, onLabelChange }) => {
    const [isListOpen, setIsListOpen] = useState(false);
    const [newLabel, setNewLabel] = useState('');
    const inputField = useRef(null);

    const placeholder = 'Input text here';
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
        onLabelChange(label.toUpperCase());
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
            onLabelChange(newLabel.toUpperCase());
            setNewLabel('');
        }
    };

    if (isVisible) {
        return (
            <EditLabelWrapper
                top={position.top}
                left={position.left}
                width={width}>
                <div className="inputContainer">
                    <input
                        className="newLabelInput"
                        placeholder={isListOpen ? '' : placeholder}
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value.toUpperCase())}
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
                                ? arrowOrientation.DOWN
                                : arrowOrientation.UP
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

EditLabel.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    position: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    onLabelChange: PropTypes.func.isRequired,
};
export default EditLabel;
