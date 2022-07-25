import React from 'react';
import PropTypes from 'prop-types';
import {
    StyledConnectionIcon,
    StyledNoConnectionIcon,
} from './connection-status.icon.styles';
import Tooltip from '@mui/material/Tooltip';

const ConnectionStatusIcon = (props) => {
    return props.isConnected ? (
        <Tooltip title={'Connected'}>
            <StyledConnectionIcon
                width={props.width}
                height={props.height}
                color={props.color}
            />
        </Tooltip>
    ) : (
        <Tooltip title={'Not Connected'}>
            <StyledNoConnectionIcon
                width={props.width}
                height={props.height}
                color={props.color}
            />
        </Tooltip>
    );
};

ConnectionStatusIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    isConnected: PropTypes.bool.isRequired,
};

export default ConnectionStatusIcon;
