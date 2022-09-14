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
import ContrastIcon from '../../icons/image-tools-fab/contrast-icon/contrast.icon';
import BrightnessIcon from '../../icons/image-tools-fab/brightness-icon/brightness.icon';
import { useSelector } from 'react-redux';
import {
    getIsFabVisible,
    getSettingsVisibility,
    getSingleViewport,
} from '../../redux/slices/ui/uiSlice';
import { Tooltip } from '@mui/material';

const ImageToolsFab = (props) => {
    const isVisible = useSelector(getIsFabVisible);
    const settingsVisibility = useSelector(getSettingsVisibility);
    const singleViewport = useSelector(getSingleViewport);
    const [open, setOpen] = useState(false);
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
    const handleOpen = () => {
        setOpen(!open);
    };

    const actions = [
        {
            icon: <InvertIcon color={'white'} height={'24px'} width={'24px'} />,
            name: 'Invert',
            action: handleInvert,
            className: invert ? 'blue' : 'grey',
        },
        {
            icon: (
                <ContrastIcon color={'white'} height={'24px'} width={'24px'} />
            ),
            name: 'Contrast',
            action: handleSelect,
            className: 'slide',
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
            className: 'slide',
        },
    ];

    console.log('isVisibile: ' + isVisible);
    console.log('settingsVisibility: ' + settingsVisibility);

    let fabOpacity;
    let show;

    if (settingsVisibility) {
        fabOpacity = false;
        show = true;
    } else if (isVisible === false) {
        fabOpacity = false;
        show = false;
    } else {
        fabOpacity = true;
        show = true;
    }

    console.log('open: ' + open);

    return (
        // <ImageToolsButtonWrapper
        //     ariaLabel={'Options Button Wrapper'}
        //     icon={<ScaleIcon color={'white'} width={'24px'} height={'24px'} />}
        //     $fabOpacity={fabOpacity}
        //     $show={show}
        //     $invert={invert}
        //     id={'Button Wrapper'}>
        //     {actions.map((action) => (
        //         <SpeedDialAction
        //             key={action.name}
        //             icon={action.icon}
        //             tooltipTitle={action.name}
        //             className={action.className}
        //             onClick={action.action}
        //         />
        //     ))}
        // </ImageToolsButtonWrapper>

        <ImageToolsWrapper
            id={'fab wrapper'}
            fabOpacity={fabOpacity}
            show={show}
            onClick={handleOpen}>
            <Tooltip title={'Image Tools'}>
                <ImageToolsButton id={'tools button'}>
                    <ScaleIcon width={'24px'} height={'24px'} color={'white'} />
                </ImageToolsButton>
            </Tooltip>

            <ToolsWrapper id={'Tools Wrapper'} $show={open}>
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
