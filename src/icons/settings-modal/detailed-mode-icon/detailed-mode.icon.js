import React from 'react';
import PropTypes from 'prop-types';
import { StyledDetailedModeIcon } from './detailed-mode.icon.styles';

const DetailedModeIcon = (props) => {
    return (
        <StyledDetailedModeIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

DetailedModeIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default DetailedModeIcon;
