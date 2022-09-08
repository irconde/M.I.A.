import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ImageToolsButtonWrapper } from './image-tools-fab.styles';
import ScaleIcon from '../../icons/image-tools-fab/scale-icon/scale.icon';
import InvertIcon from '../../icons/image-tools-fab/invert-icon/invert.icon';
import ContrastIcon from '../../icons/image-tools-fab/contrast-icon/contrast.icon';
import BrightnessIcon from '../../icons/image-tools-fab/brightness-icon/brightness.icon';
import { useSelector } from 'react-redux';
import {
    getIsFabVisible,
    getSettingsVisibility,
    getSingleViewport,
} from '../../redux/slices/ui/uiSlice';
import { SpeedDialAction } from '@mui/material';

const ImageToolsFab = (props) => {
    const isVisible = useSelector(getIsFabVisible);
    const settingsVisibility = useSelector(getSettingsVisibility);
    const singleViewport = useSelector(getSingleViewport);

    const [invert, setInvert] = useState(false);
    const handleInvert = () => {
        setInvert(!invert);
        console.log('Invert: ' + invert);

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
    const handleSelect = () => {};

    const actions = [
        {
            icon: <InvertIcon color={'white'} height={'24px'} width={'24px'} />,
            name: 'Invert',
            action: handleInvert,
        },
        {
            icon: (
                <ContrastIcon color={'white'} height={'24px'} width={'24px'} />
            ),
            name: 'Contrast',
            action: handleSelect,
        },
        {
            icon: (
                <BrightnessIcon
                    color={'white'}
                    height={'24px'}
                    width={'24px'}
                />
            ),
            name: 'Brightness',
            action: handleSelect,
        },
    ];

    let fabOpacity;
    let show;

    if (settingsVisibility) {
        fabOpacity = false;
        show = true;
    } else if (isVisible === false) {
        show = false;
    } else {
        fabOpacity = true;
        show = true;
    }

    return (
        <ImageToolsButtonWrapper
            ariaLabel={'Options Button Wrapper'}
            icon={<ScaleIcon color={'white'} width={'24px'} height={'24px'} />}
            $fabOpacity={fabOpacity}
            $show={show}
            $invert={invert}
            id={'Button Wrapper'}>
            {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={action.action}
                />
            ))}
        </ImageToolsButtonWrapper>
    );
};

ImageToolsFab.propTypes = {
    cornerstone: PropTypes.object.isRequired,
    imageViewportTop: PropTypes.object.isRequired,
    imageViewportSide: PropTypes.object.isRequired,
};

export default ImageToolsFab;
