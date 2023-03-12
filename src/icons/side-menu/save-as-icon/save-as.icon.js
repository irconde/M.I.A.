import React from 'react';
import PropTypes from 'prop-types';
import { StyledSaveAsIcon } from './save-as.icon.styles';

const SaveAsIcon = (props) => {
    return (
        <StyledSaveAsIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};
SaveAsIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};
export default SaveAsIcon;
