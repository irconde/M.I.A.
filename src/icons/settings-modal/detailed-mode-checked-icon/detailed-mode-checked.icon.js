import React from 'react';
import PropTypes from 'prop-types';
import { StyledDetailedModeCheckedIcon } from './detailed-mode-checked.icon.styles';

const DetailedModeCheckedIcon = (props) => {
    return (
        <StyledDetailedModeCheckedIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

DetailedModeCheckedIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default DetailedModeCheckedIcon;
