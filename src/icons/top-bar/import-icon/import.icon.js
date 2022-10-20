import React from 'react';
import PropTypes from 'prop-types';
import { StyledImportIcon } from './import.icon.styles';

const ImportIcon = (props) => {
    return (
        <StyledImportIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

ImportIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default ImportIcon;
