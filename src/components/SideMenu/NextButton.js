import React from 'react';
import styled from 'styled-components';
import nextIcon from '../../icons/navigate_next.png';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
    getCornerstoneMode,
    getCollapsedSideMenu,
} from '../../redux/slices/ui/uiSlice';
import * as constants from '../../utils/Constants';
import { getSelectedDetection } from '../../redux/slices/detections/detectionsSlice';
import { getConnected } from '../../redux/slices/server/serverSlice';
import Fab from '@mui/material/Fab';
import { getLocalFileOutput } from '../../redux/slices/settings/settingsSlice';

const sideMenuWidth = constants.sideMenuWidth + constants.RESOLUTION_UNIT;

const CollapsedNextButtonContainer = styled.div`
    width: 75px;
    margin: 50px;
    position: absolute;
    bottom: 0;
    right: 0;
    transform: translate(${sideMenuWidth})
    transition: all 0.3s ease-in;
    display: flex;
    justify-content: center;

    opacity: ${(props) => (props.enabled ? '100%' : '38%')} img {
        height: 2em;
        width: auto;
        margin-right: 0.5em;
    }

    img {
        height: 2em;
        width: auto;
        margin-top: auto;
        margin-bottom: auto;
        transition: all 0.1s ease-in;
    }

    &:hover {
        cursor: pointer;
    }
`;

const NextButtonContainer = styled.div`
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

const NextButton = ({ nextImageClick, collapseBtn = false }) => {
    const cornerstoneMode = useSelector(getCornerstoneMode);
    const selectedDetection = useSelector(getSelectedDetection);
    const connected = useSelector(getConnected);
    const isCollapsed = useSelector(getCollapsedSideMenu);
    const localFileOutput = useSelector(getLocalFileOutput);
    const enableNextButton =
        !selectedDetection &&
        cornerstoneMode === constants.cornerstoneMode.SELECTION &&
        (connected === true || localFileOutput !== '');
    const handleClick = (e) => {
        if (enableNextButton) {
            nextImageClick(e);
        }
    };

    if (collapseBtn)
        return (
            <CollapsedNextButtonContainer
                isCollapsed={isCollapsed}
                style={{
                    transition: 'all 0.3s ease-in',
                    transform: isCollapsed
                        ? 'translateY(0)'
                        : `translateY(${sideMenuWidth})`,
                }}>
                <Fab
                    onClick={handleClick}
                    disabled={!enableNextButton}
                    color="primary">
                    {!enableNextButton ? <></> : <img src={nextIcon} />}
                </Fab>
            </CollapsedNextButtonContainer>
        );
    else
        return (
            <NextButtonContainer
                enabled={enableNextButton}
                onClick={handleClick}
                id="nextButton">
                <p>Next</p>
                <img src={nextIcon} />
            </NextButtonContainer>
        );
};

NextButton.propTypes = {
    nextImageClick: PropTypes.func.isRequired,
    collapseBtn: PropTypes.bool,
};

export default NextButton;
