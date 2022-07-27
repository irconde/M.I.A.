import React from 'react';
import PropTypes from 'prop-types';
import {
    StyledConnectionIcon,
    StyledNoConnectionIcon,
} from './connection-status.icon.styles';

const ConnectionStatusIcon = (props) => {
    return props.isConnected ? (
        <StyledConnectionIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    ) : (
        <StyledNoConnectionIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

ConnectionStatusIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    isConnected: PropTypes.bool.isRequired,
};

export default ConnectionStatusIcon;
