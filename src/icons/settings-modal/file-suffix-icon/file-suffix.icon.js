import React from 'react';
import PropTypes from 'prop-types';
import { StyledFileSuffixIcon } from './file-suffix.icon.styles';

const FileSuffixIcon = (props) => {
    return (
        <StyledFileSuffixIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

FileSuffixIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default FileSuffixIcon;
