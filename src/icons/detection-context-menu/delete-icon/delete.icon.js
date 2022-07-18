import React from 'react';
import PropTypes from 'prop-types';
import { StyledDeleteIcon } from './delete.icon.styles';

const DeleteIcon = (props) => {
    return (
        <StyledDeleteIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

DeleteIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    pathColor: PropTypes.string.isRequired,
    fillColor: PropTypes.string.isRequired,
};

export default DeleteIcon;
