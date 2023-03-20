import React from 'react';
import PropTypes from 'prop-types';
import { StyledConfirmImportIcon } from './confirm-import.icon.styles';

const ConfirmImportIcon = (props) => {
    return (
        <StyledConfirmImportIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

ConfirmImportIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default ConfirmImportIcon;
