import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as constants from '../../utils/enums/Constants';
import { useDispatch, useSelector } from 'react-redux';
import {
    ArrowIconWrapper,
    ClearIconWrapper,
    EditLabelWrapper,
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
    const [position, setPosition] = useState({
        x: 0,
        y: 0,
    });
    const labels = useSelector(getAnnotationCategories);
    const inputField = useRef(null);
    const [isListOpen, setIsListOpen] = useState(false);
    const [showClearIcon, setShowClearIcon] = useState(false);

    useEffect(() => {
        console.log({ newLabel });
    }, [newLabel]);

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

    const formattedLabels = labels?.filter((label) => label !== 'unknown');

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
        const value = e.target.value.trim();
        if (e.key === 'Enter' && value) {
            dispatch(updateEditLabelVisibility(false));
            dispatch(updateAnnotationContextVisibility(true));
            Utils.dispatchAndUpdateImage(dispatch, updateAnnotationCategory, {
                id: selectedAnnotation.id,
                newCategory: value,
            });
            dispatch(setInputLabel(''));
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
     * Triggered when the edit label input field is changed. Shows and hides the clear icon
     *
     * @param {Event} e - change event object
     */
    const handleLabelInputChange = (e) => {
        const { value } = e.target;
        setShowClearIcon(!!value.length);
        dispatch(setInputLabel(value.toUpperCase()));
    };

    const { BORDER_WIDTH, LABEL_HEIGHT } = constants.annotationStyle;
    /**
     * Scales the given width by the zoom level and account for the detection border width
     *
     * @param {number} width
     * @returns {number}
     */
    const getWidth = (width) => {
        return width ? scaleByZoom(width) + BORDER_WIDTH : 0;
    };

    return (
        isVisible && (
            <EditLabelWrapper
                top={position.y - LABEL_HEIGHT}
                left={position.x - BORDER_WIDTH / 2}
                width={getWidth(selectedAnnotation?.bbox[2])}>
                <InputContainer isListOpen={isListOpen}>
                    <NewLabelInput
                        placeholder={'unknown'}
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
                        setIsListOpen((isListOpen) => {
                            !isListOpen && setShowClearIcon(false);
                            return !isListOpen;
                        });
                    }}>
                    <ExpandIcon
                        direction={isListOpen ? 'up' : 'down'}
                        height="24px"
                        width="24px"
                        color={'white'}
                    />
                </ArrowIconWrapper>
            </EditLabelWrapper>
        )
    );
};

export default EditLabelComponent;
