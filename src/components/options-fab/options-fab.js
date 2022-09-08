import React from 'react';
import { useSelector } from 'react-redux';
import { getCornerstoneMode } from '../../redux/slices/ui/uiSlice';
import PropTypes from 'prop-types';

const OptionsFab = ({ cornerstone }) => {
    const [open, setOpen] = React.useState(false);
    const cornerstoneMode = useSelector(getCornerstoneMode);

    const viewportTop = cornerstone.getViewport(this.state.imageViewportTop);
    viewportTop.invert = !viewportTop.invert;
    cornerstone.setViewport(this.state.imageViewportTop, viewportTop);
    if (!this.props.singleViewport) {
        const viewportSide = cornerstone.getViewport(
            this.state.imageViewportSide
        );
        viewportSide.invert = !viewportSide.invert;
        cornerstone.setViewport(this.state.imageViewportSide, viewportSide);
    }

    return (
        <div id={'Button Wrapper'}>
            <div id={'Speed Dial Button'}>
                <div id={'Speed Dial Action'} />
            </div>
        </div>
    );
};

OptionsFab.propTypes = {
    cornerstone: PropTypes.object,
};

export default OptionsFab;
