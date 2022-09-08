import React from 'react';
import { OptionsButtonWrapper } from './options-fab.styles';
import ScaleIcon from '../../icons/options-fab/scale-icon/scale.icon';
import InvertIcon from '../../icons/options-fab/invert-icon/invert.icon';
import ContrastIcon from '../../icons/options-fab/contrast-icon/contrast.icon';
import BrightnessIcon from '../../icons/options-fab/brightness-icon/brightness.icon';
import { SpeedDialAction } from '@mui/material';

const OptionsFab = () => {
    const [open, setOpen] = React.useState(false);

    // const viewportTop = cornerstone.getViewport(this.state.imageViewportTop);
    // viewportTop.invert = !viewportTop.invert;
    // cornerstone.setViewport(this.state.imageViewportTop, viewportTop);
    // if (!this.props.singleViewport) {
    //     const viewportSide = cornerstone.getViewport(
    //         this.state.imageViewportSide
    //     );
    //     viewportSide.invert = !viewportSide.invert;
    //     cornerstone.setViewport(this.state.imageViewportSide, viewportSide);
    // }

    const actions = [
        {
            icon: <InvertIcon color={'white'} height={'24px'} width={'24px'} />,
            name: 'Invert',
        },
        {
            icon: (
                <ContrastIcon color={'white'} height={'24px'} width={'24px'} />
            ),
            name: 'Contrast',
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
        },
    ];

    return (
        <OptionsButtonWrapper
            ariaLabel={'Options Button Wrapper'}
            icon={<ScaleIcon color={'white'} width={'24px'} height={'24px'} />}
            id={'Button Wrapper'}>
            {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                />
            ))}
        </OptionsButtonWrapper>
    );
};
//
// OptionsFab.propTypes = {
//     cornerstone: PropTypes.object,
// };

export default OptionsFab;
