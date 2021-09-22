import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getDetectionChanged } from '../../redux/slices/detections/detectionsSlice';
import SaveIcon from '../../icons/SaveIcon';

const SaveButtonContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    align-self: flex-end;
    justify-content: center;
    background-color: ${(props) => (props.enabled ? '#367eff' : '#252525')};
    box-shadow: 0.1rem -0.4rem 2rem 0.2rem rgb(0 0 0 / 50%);
    font-size: 12pt;
    height: 75px;
    cursor: ${(props) => (props.enabled ? 'pointer' : 'normal')};

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
            <SaveIcon
                title="Save File"
                style={{ marginRight: '4%', display: 'inherit' }}
            />
            <p style={{ display: 'contents' }}>Save File</p>
        </SaveButtonContainer>
    );
};

SaveButton.propTypes = {
    saveImageClick: PropTypes.func.isRequired,
};

export default SaveButton;
