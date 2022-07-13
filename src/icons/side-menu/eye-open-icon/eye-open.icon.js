import React from 'react';
import PropTypes from 'prop-types';
import { StyledEyeOpenIcon } from './eye-open.icon.styles';

const EyeOpenIcon = (props) => {
    return (
        <StyledEyeOpenIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

EyeOpenIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default EyeOpenIcon;
