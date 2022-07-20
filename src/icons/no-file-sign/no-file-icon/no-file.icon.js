import React from 'react';
import PropTypes from 'prop-types';
import { StyledNoFileIcon } from './no-file.icon.styles.js';

const NoFileIcon = (props) => {
    return (
        <StyledNoFileIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

NoFileIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default NoFileIcon;
