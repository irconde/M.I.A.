import React, { useLayoutEffect, useRef, useState } from 'react';
import { annotationStyle, UNKNOWN } from '../../utils/enums/Constants';
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
    getZoomLevel,
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

const { BORDER_WIDTH, LABEL_HEIGHT } = annotationStyle;

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
    const [value, setValue] = useState('');
    const labels = useSelector(getAnnotationCategories);
    const inputRef = useRef(null);
    const [isListOpen, setIsListOpen] = useState(false);
    const [position, setPosition] = useState({
        x: 0,
        y: 0,
    });

    // runs when the input widget becomes visible
    useLayoutEffect(() => {
        if (!isVisible || !selectedAnnotation) return setIsListOpen(false);
        const newViewport = document.getElementById('imageContainer');
        if (newViewport === null) return;
        const { offsetLeft, offsetTop } = newViewport;
        const horizontalGap = offsetLeft / zoomLevel;
        const verticalGap = offsetTop / zoomLevel;

        setValue(selectedAnnotation.categoryName);
        inputRef.current.focus();

        try {
            const coordinates = cornerstone.pixelToCanvas(newViewport, {
                x: selectedAnnotation.bbox[0] + horizontalGap,
                y: selectedAnnotation.bbox[1] + verticalGap,
            });
            setPosition(coordinates);
        } catch (e) {
            console.log(e);
        }
    }, [isVisible, selectedAnnotation]);

    const formattedLabels = labels?.filter(
        (label) => label.toLowerCase() !== UNKNOWN
    );

    /**
     * Select new label from list of existing detection labels
     * @param {string} label New label passed up from `LabelList` component
     */
    const submitFromList = (label) => {
        setIsListOpen(false);
        submit(label);
    };
    /**
     * Called on every keydown in label input field.
     * If `Enter` is pressed, submit the new label using the stored value in state,
     * which is updated `onChange` in the input field
     * @param {KeyboardEvent} e event fired for every key press
     */
    const submitFromInput = (e) => {
        if (e.key !== 'Enter') return;
        submit(value.trim() || UNKNOWN);
    };

    const submit = (value) => {
        dispatch(updateEditLabelVisibility(false));
        dispatch(updateAnnotationContextVisibility(true));
        Utils.dispatchAndUpdateImage(dispatch, updateAnnotationCategory, {
            id: selectedAnnotation.id,
            newCategory: value,
        });
        setValue('');
    };

    const scaleByZoom = (value) => value * zoomLevel;

    const getWidth = (width) => scaleByZoom(width) + BORDER_WIDTH;

    return (
        isVisible &&
        selectedAnnotation && (
            <EditLabelWrapper
                top={position.y - LABEL_HEIGHT}
                left={position.x - BORDER_WIDTH / 2}
                width={getWidth(selectedAnnotation.bbox[2])}>
                <InputContainer isListOpen={isListOpen}>
                    <NewLabelInput
                        placeholder={UNKNOWN}
                        value={value.toLowerCase()}
                        onChange={({ target }) => setValue(target.value)}
                        onKeyDown={submitFromInput}
                        disabled={isListOpen}
                        ref={inputRef}
                    />

                    {isListOpen ? (
                        <LabelListComponent
                            width={selectedAnnotation.bbox[2]}
                            labels={formattedLabels}
                            onLabelSelect={submitFromList}
                        />
                    ) : (
                        !!value.length && (
                            <ClearIconWrapper
                                onClick={() => {
                                    inputRef.current.focus();
                                    setValue('');
                                }}>
                                <ClearIcon
                                    width={'20px'}
                                    height={'20px'}
                                    color={'rgba(255, 255, 255, 0.5)'}
                                />
                            </ClearIconWrapper>
                        )
                    )}
                </InputContainer>
                <ArrowIconWrapper
                    onClick={() => {
                        isListOpen &&
                            setTimeout(() => inputRef.current.focus(), 0);
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
        )
    );
};

export default EditLabelComponent;
