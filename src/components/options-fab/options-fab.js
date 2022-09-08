import React from 'react';
import { OptionsButtonWrapper } from './options-fab.styles';

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

    return (
        <OptionsButtonWrapper
            ariaLabel={'Options Button Wrapper'}
            id={'Button Wrapper'}>
            <div id={'Speed Dial Button'}>
                <div id={'Speed Dial Action'} />
            </div>
        </OptionsButtonWrapper>
    );
};
//
// OptionsFab.propTypes = {
//     cornerstone: PropTypes.object,
// };

export default OptionsFab;
