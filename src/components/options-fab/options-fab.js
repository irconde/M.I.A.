import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { OptionsButtonWrapper } from './options-fab.styles';
import ScaleIcon from '../../icons/options-fab/scale-icon/scale.icon';
import InvertIcon from '../../icons/options-fab/invert-icon/invert.icon';
import ContrastIcon from '../../icons/options-fab/contrast-icon/contrast.icon';
import BrightnessIcon from '../../icons/options-fab/brightness-icon/brightness.icon';
import { useSelector } from 'react-redux';
import {
    getIsFabVisible,
    getSettingsVisibility,
} from '../../redux/slices/ui/uiSlice';
import { SpeedDialAction } from '@mui/material';

const OptionsFab = (props) => {
    const isVisible = useSelector(getIsFabVisible);
    const settingsVisibility = useSelector(getSettingsVisibility);

    const [invert, setInvert] = useState(false);
    const handleInvert = () => {
        setInvert(!invert);
        console.log('Invert: ' + invert);

        const viewportTop = props.cornerstone.getViewport(
            this.state.imageViewportTop
        );
        viewportTop.invert = !viewportTop.invert;
        props.cornerstone.setViewport(this.state.imageViewportTop, viewportTop);
        if (!this.props.singleViewport) {
            const viewportSide = props.cornerstone.getViewport(
                this.state.imageViewportSide
            );
            viewportSide.invert = !viewportSide.invert;
            props.cornerstone.setViewport(
                this.state.imageViewportSide,
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
        <OptionsButtonWrapper
            ariaLabel={'Options Button Wrapper'}
            icon={<ScaleIcon color={'white'} width={'24px'} height={'24px'} />}
            fabOpacity={fabOpacity}
            show={show}
            invert={invert}
            id={'Button Wrapper'}>
            {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={action.action}
                />
            ))}
        </OptionsButtonWrapper>
    );
};

OptionsFab.propTypes = {
    cornerstone: PropTypes.object,
};

export default OptionsFab;
