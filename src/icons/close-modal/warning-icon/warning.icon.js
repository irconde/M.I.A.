import React from 'react';
import PropTypes from 'prop-types';
import { StyledWarningIcon } from './warning.icon.styles';

const WarningIcon = (props) => {
    return (
        <StyledWarningIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};
WarningIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};
export default WarningIcon;
