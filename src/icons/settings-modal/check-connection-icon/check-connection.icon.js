import React from 'react';
import PropTypes from 'prop-types';
import { StyledCheckConnectionIcon } from './check-connection.icon.styles';

const CheckConnectionIcon = (props) => {
    return (
        <StyledCheckConnectionIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

CheckConnectionIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default CheckConnectionIcon;
