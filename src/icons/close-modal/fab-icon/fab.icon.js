import React from 'react';
import PropTypes from 'prop-types';
import { StyledFabIcon } from './fab.icon.styles';

const FabIcon = (props) => {
    return (
        <StyledFabIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

FabIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default FabIcon;
