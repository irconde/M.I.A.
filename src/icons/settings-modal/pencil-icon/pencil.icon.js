import React from 'react';
import PropTypes from 'prop-types';
import { StyledPencilIcon } from './pencil.icon.styles';

const PencilIcon = (props) => {
    return (
        <StyledPencilIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

PencilIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default PencilIcon;
