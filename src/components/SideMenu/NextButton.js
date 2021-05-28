import React from 'react';
import styled from 'styled-components';
import nextIcon from '../../icons/navigate_next.png';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
    getCornerstoneMode,
    getDisplaySelectedBoundingBox,
} from '../../redux/slices/ui/uiSlice';
import * as constants from '../../Constants';

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

const NextButton = ({ nextImageClick }) => {
    const cornerstoneMode = useSelector(getCornerstoneMode);
    const displaySelectedBoundingBox = useSelector(
        getDisplaySelectedBoundingBox
    );
    const enableNextButton =
        !displaySelectedBoundingBox &&
        cornerstoneMode === constants.cornerstoneMode.SELECTION;
    const handleClick = (e) => {
        if (enableNextButton) {
            nextImageClick(e);
        }
    };
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
};

export default NextButton;
