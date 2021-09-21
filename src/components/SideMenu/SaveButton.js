import React from 'react';
import styled from 'styled-components';
import { ReactComponent as SaveIcon } from '../../icons/ic_download.svg';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getDetectionChanged } from '../../redux/slices/detections/detectionsSlice';

const SaveButtonContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    align-self: flex-end;
    justify-content: center;
    background-color: #367eff;
    font-weight: bold;
    font-size: 12pt;
    height: 75px;

    opacity: ${(props) => (props.enabled ? '100%' : '38%')};
    p {
        flex: 1;
        text-transform: uppercase;
        text-align: center;
        color: white;
    }

    img {
        height: 2em;
        width: auto;
        margin-right: 0.5em;
    }
`;

const SaveButton = ({ saveImageClick }) => {
    const detectionChanged = useSelector(getDetectionChanged);
    return (
        <SaveButtonContainer enabled={detectionChanged} id="saveButton">
            <SaveIcon />
            <p>Save File</p>
        </SaveButtonContainer>
    );
};

SaveButton.propTypes = {
    saveImageClick: PropTypes.func.isRequired,
};

export default SaveButton;
