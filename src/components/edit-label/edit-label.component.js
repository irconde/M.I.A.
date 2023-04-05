import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as constants from '../../utils/enums/Constants';
import { useDispatch, useSelector } from 'react-redux';
import {
    ArrowIconWrapper,
    ClearIconWrapper,
    EditLabelWrapper,
    INPUT_HEIGHT,
    InputContainer,
    NewLabelInput,
} from './edit-label.styles';
import LabelListComponent from './label-list.component';
import ClearIcon from '../../icons/edit-label/clear-icon/clear.icon';
import {
    getEditLabelVisible,
    getInputLabel,
    getZoomLevel,
    setInputLabel,
    updateAnnotationContextVisibility,
    updateEditLabelVisibility,
} from '../../redux/slices/ui.slice';
import { cornerstone } from '../image-display/image-display.component';
import {
    getAnnotationCategories,
    getSelectedAnnotation,
    updateAnnotationCategory,
} from '../../redux/slices/annotation.slice';
import Utils from '../../utils/general/Utils';
import ExpandIcon from '../../icons/shared/expand-icon/expand.icon';

/**
 * Widget for editing a selected detection's label.
 * Contains text input box and list of existing labels.
 * List of labels is visible when toggled by arrow button.
 */
const EditLabelComponent = () => {
    const dispatch = useDispatch();
    const zoomLevel = useSelector(getZoomLevel);
    const isVisible = useSelector(getEditLabelVisible);
    const selectedAnnotation = useSelector(getSelectedAnnotation);
    const newLabel = useSelector(getInputLabel);
    const viewport = document.getElementById('imageContainer');
    const [position, setPosition] = useState({
        x: 0,
        y: 0,
    });

    useLayoutEffect(() => {
        if (isVisible) {
            const newViewport = document.getElementById('imageContainer');
            if (newViewport !== null) {
                const { offsetLeft, offsetTop } = newViewport;
                const horizontalGap = offsetLeft / zoomLevel;
                const verticalGap = offsetTop / zoomLevel;

                try {
                    const coordinates = cornerstone.pixelToCanvas(newViewport, {
                        x: selectedAnnotation?.bbox[0] + horizontalGap,
                        y: selectedAnnotation?.bbox[1] + verticalGap,
                    });
                    setPosition(coordinates);
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }, [isVisible, selectedAnnotation]);

    const labels = useSelector(getAnnotationCategories);
    const inputField = useRef(null);
    const [isListOpen, setIsListOpen] = useState(false);
    const [showClearIcon, setShowClearIcon] = useState(false);
    const fontArr = constants.annotationStyle.LABEL_FONT.split(' ');
    const fontSizeArr = fontArr[1].split('px');
    fontSizeArr[0] = fontSizeArr[0] * zoomLevel;
    const newFontSize = fontSizeArr.join('px');
    const font = fontArr[0] + ' ' + newFontSize + ' ' + fontArr[2];

    const formattedLabels = labels?.filter((label) => label !== 'unknown');

    const placeholder = 'Input text';

    // Clear input field when list is opened
    useEffect(() => {
        if (isListOpen) {
            setShowClearIcon(false);
        }
    }, [isListOpen]);
    useEffect(() => {
        // When component is updated to be visible or the label list is closed, focus the text input field for user
        // input
        if (isVisible && !isListOpen) {
            inputField.current.focus();
            setShowClearIcon(true);
            // set the value of the text input to the current detection class name
            if (inputField.current.value === '') {
                dispatch(
                    setInputLabel(selectedAnnotation.categoryName.toUpperCase())
                );
            }
        }

        // Reset label list visibility when component is hidden
        if (!isVisible) {
            setIsListOpen(false);
            setShowClearIcon(false);
            dispatch(setInputLabel(''));
        }
    }, [isVisible, isListOpen]);

    /**
     * Select new label from list of existing detection labels
     * @param {string} label New label passed up from `LabelList` component
     */
    const submitFromList = (label) => {
        setIsListOpen(false);
        dispatch(setInputLabel(label.toUpperCase()));
    };
    /**
     * Called on every keydown in label input field.
     * If `Enter` is pressed, submit the new label using the stored value in state,
     * which is updated `onChange` in the input field
     * @param {KeyboardEvent} e event fired for every key press
     */
    const submitFromInput = (e) => {
        if (e.key === 'Enter' && e.target.value !== '') {
            dispatch(updateEditLabelVisibility(false));
            dispatch(updateAnnotationContextVisibility(true));
            dispatch(setInputLabel(''));
            Utils.dispatchAndUpdateImage(dispatch, updateAnnotationCategory, {
                id: selectedAnnotation.id,
                newCategory: newLabel,
            });
        }
    };

    /**
     * Scales a value based on the given viewport's zoom level
     * @param {number} value
     * @returns {number}
     */
    const scaleByZoom = (value) => {
        return value * zoomLevel;
    };

    /**
     * Calculate the font size based on the given string
     * @param {string} str
     * @returns {number} fontSize
     */
    const getFontSize = (str) => {
        let fontArr = str.split(' ');
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

    const { BORDER_WIDTH } = constants.annotationStyle;
    /**
     * Scales the given width by the zoom level and account for the detection border width
     *
     * @param {number} width
     * @returns {number}
     */
    const getWidth = (width) => {
        return width ? scaleByZoom(width) + BORDER_WIDTH : 0;
    };

    if (isVisible) {
        return (
            <EditLabelWrapper
                viewport={viewport}
                top={position.y - INPUT_HEIGHT}
                left={position.x - BORDER_WIDTH / 2}
                width={getWidth(selectedAnnotation?.bbox[2])}
                zoomLevel={zoomLevel}
                fontSize={getFontSize(font)}>
                <InputContainer isListOpen={isListOpen}>
                    <NewLabelInput
                        placeholder={isListOpen ? '' : placeholder}
                        value={newLabel.toLowerCase()}
                        onChange={handleLabelInputChange}
                        onKeyDown={submitFromInput}
                        disabled={isListOpen}
                        ref={inputField}
                    />

                    {isListOpen && (
                        <LabelListComponent
                            width={selectedAnnotation?.bbox[2]}
                            labels={formattedLabels}
                            onLabelSelect={submitFromList}
                        />
                    )}
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
                                color={'rgba(255, 255, 255, 0.5)'}
                            />
                        </ClearIconWrapper>
                    )}
                </InputContainer>
                <ArrowIconWrapper
                    onClick={() => {
                        setIsListOpen(!isListOpen);
                    }}>
                    <ExpandIcon
                        direction={isListOpen ? 'up' : 'down'}
                        height="24px"
                        width="24px"
                        color={'white'}
                    />
                </ArrowIconWrapper>
            </EditLabelWrapper>
        );
    } else return null;
};

export default EditLabelComponent;
