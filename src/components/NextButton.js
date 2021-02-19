import React from 'react';
import styled from 'styled-components';
import nextIcon from '../icons/navigate_next.png';
import PropTypes from 'prop-types';

const NextButtonContainer = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    align-self: flex-end;
    justify-content: center;
    background-color: #367eff;
    margin-bottom: 3em;
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

const NextButton = ({ enableNextButton, nextImageClick }) => {
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
    enableNextButton: PropTypes.bool.isRequired,
    nextImageClick: PropTypes.func.isRequired,
};

export default NextButton;
