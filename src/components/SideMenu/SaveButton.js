import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getCollapsedSideMenu } from '../../redux/slices/ui/uiSlice';
import * as constants from '../../utils/Constants';
import { getDetectionChanged } from '../../redux/slices/detections/detectionsSlice';
import SaveIcon from '../../icons/SaveIcon';

const sideMenuWidth = constants.sideMenuWidth + constants.RESOLUTION_UNIT;

const CollapsedSaveButtonContainer = styled.div`
    width: 75px;
    margin: 50px;
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: #367eff;
    height: 75px;
    border-radius: 50%;
    transition: all 0.3s ease-in;
    display: flex;
    justify-content: center;

    opacity: ${(props) => (props.enabled ? '100%' : '38%')} img {
        height: 2em;
        width: auto;
        margin-right: 0.5em;
    }

    div svg {
        height: 2em;
        width: auto;
        margin-top: auto;
        margin-bottom: auto;
        transition: all 0.1s ease-in;
    }

    &:hover {
        cursor: pointer;

        div svg {
            height: 4em;
            width: auto;
        }
    }
`;

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

const SaveButton = ({ nextImageClick, collapseBtn = false }) => {
    const isCollapsed = useSelector(getCollapsedSideMenu);
    const detectionChanged = useSelector(getDetectionChanged);
    if (collapseBtn)
        return (
            <CollapsedSaveButtonContainer
                enabled={detectionChanged}
                onClick={() => nextImageClick()}
                isCollapsed={isCollapsed}
                style={{
                    transform: isCollapsed
                        ? 'translate(0)'
                        : `translate(${sideMenuWidth})`,
                }}
                id="collapsedSaveButton">
                <SaveIcon
                    title="Save File"
                    style={{ marginRight: '4%', display: 'inherit' }}
                />
            </CollapsedSaveButtonContainer>
        );
    else
        return (
            <SaveButtonContainer
                enabled={detectionChanged}
                onClick={() => nextImageClick()}
                id="saveButton">
                <SaveIcon
                    title="Save File"
                    style={{ marginRight: '4%', display: 'inherit' }}
                />
                <p style={{ display: 'contents' }}>Save File</p>
            </SaveButtonContainer>
        );
};

SaveButton.propTypes = {
    nextImageClick: PropTypes.func.isRequired,
    collapseBtn: PropTypes.bool,
};

export default SaveButton;
