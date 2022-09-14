import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    ImageToolsButton,
    ImageToolsWrapper,
    InvertButton,
    ToolsWrapper,
} from './image-tools-fab.styles';
import ScaleIcon from '../../icons/image-tools-fab/scale-icon/scale.icon';
import InvertIcon from '../../icons/image-tools-fab/invert-icon/invert.icon';
import { useDispatch, useSelector } from 'react-redux';
import {
    getIsFabVisible,
    getIsImageToolsOpen,
    getSettingsVisibility,
    getSingleViewport,
    toggleImageToolsOpen,
} from '../../redux/slices/ui/uiSlice';
import { Tooltip } from '@mui/material';

const ImageToolsFab = (props) => {
    const isOpen = useSelector(getIsImageToolsOpen);
    const dispatch = useDispatch();
    const isVisible = useSelector(getIsFabVisible);
    const settingsVisibility = useSelector(getSettingsVisibility);
    const singleViewport = useSelector(getSingleViewport);
    const [invert, setInvert] = useState(false);
    const handleInvert = () => {
        setInvert(!invert);
        const viewportTop = props.cornerstone.getViewport(
            props.imageViewportTop
        );
        viewportTop.invert = !viewportTop.invert;
        props.cornerstone.setViewport(props.imageViewportTop, viewportTop);
        if (!singleViewport) {
            const viewportSide = props.cornerstone.getViewport(
                props.imageViewportSide
            );
            viewportSide.invert = !viewportSide.invert;
            props.cornerstone.setViewport(
                props.imageViewportSide,
                viewportSide
            );
        }
    };

    /**
     * Gets FAB info to determine the show/hide and FAB opacity
     *
     * @returns {{fabOpacity: boolean, show: boolean}}
     */
    const getFABInfo = () => {
        if (settingsVisibility) {
            return { fabOpacity: false, show: true };
        } else {
            return { fabOpacity: isVisible, show: isVisible };
        }
    };

    return (
        <ImageToolsWrapper
            id={'fab wrapper'}
            {...getFABInfo()}
            onClick={() => dispatch(toggleImageToolsOpen())}>
            <Tooltip title={'Image Tools'}>
                <ImageToolsButton id={'tools button'}>
                    <ScaleIcon width={'24px'} height={'24px'} color={'white'} />
                </ImageToolsButton>
            </Tooltip>

            <ToolsWrapper id={'Tools Wrapper'} $show={isOpen}>
                <Tooltip title={'Invert'} placement={'right'}>
                    <InvertButton
                        id={'Invert Button'}
                        $invert={invert}
                        className={invert ? 'blue' : 'grey'}
                        onClick={handleInvert}>
                        <InvertIcon
                            width={'24px'}
                            height={'24px'}
                            color={'white'}
                        />
                    </InvertButton>
                </Tooltip>
            </ToolsWrapper>
        </ImageToolsWrapper>
    );
};

ImageToolsFab.propTypes = {
    cornerstone: PropTypes.object.isRequired,
    imageViewportTop: PropTypes.object.isRequired,
    imageViewportSide: PropTypes.object.isRequired,
};

export default ImageToolsFab;
