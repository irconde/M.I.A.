import React from 'react';
import styled from 'styled-components';
import nextIcon from '../icons/navigate_next.png';
import PropTypes from 'prop-types';

const NextButtonContainer = styled.div`
    width: inherit;
    display: flex;
    align-items: center;
    align-self: flex-end;
    justify-content: center;
    background-color: #367eff;
    margin-bottom: 3em;

    opacity: ${(props) => (props.disabled ? '38%' : '100%')};
    p {
        flex: 1;
        text-transform: uppercase;
        text-align: center;
        color: white;
    }

    img {
        height: 2em;
        width: auto;
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
            disabled={!enableNextButton}
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
