import React from 'react';
import PropTypes from 'prop-types';
import { StyledSaveIcon } from './save.icon.styles';

const SaveIcon = (props) => {
    return (
        <StyledSaveIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

SaveIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default SaveIcon;
