import React from 'react';
import { OptionsButtonWrapper } from './options-fab.styles';
import ScaleIcon from '../../icons/options-fab/scale-icon/scale.icon';

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

    // const actions = [
    //     { icon: <FileCopyIcon />, name: 'Copy' },
    //     { icon: <SaveIcon />, name: 'Save' },
    //     { icon: <PrintIcon />, name: 'Print' },
    //     { icon: <ShareIcon />, name: 'Share' },
    // ];

    return (
        <OptionsButtonWrapper
            ariaLabel={'Options Button Wrapper'}
            icon={<ScaleIcon color={'white'} width={'24px'} height={'24px'} />}
            id={'Button Wrapper'}>
            {/*{actions.map((action) => (*/}
            {/*    <SpeedDialAction*/}
            {/*        key={action.name}*/}
            {/*        icon={action.icon}*/}
            {/*        tooltipTitle={action.name}*/}
            {/*    />*/}
            {/*))}*/}
        </OptionsButtonWrapper>
    );
};
//
// OptionsFab.propTypes = {
//     cornerstone: PropTypes.object,
// };

export default OptionsFab;
