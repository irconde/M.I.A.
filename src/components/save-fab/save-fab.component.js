import React, { useState } from 'react';
import styled, { css } from 'styled-components';

const FAB_HEIGHT = '4rem';
const ACTION_FAB_HEIGHT = '3.5rem';

const FabWrapper = styled.div`
    position: absolute;
    bottom: 2rem;
    right: 2rem;
    z-index: 999;
    height: auto;
    outline: 1px solid red;
    display: flex;
    align-items: center;
    flex-direction: column;
`;

const FabButton = styled.button`
    width: ${FAB_HEIGHT};
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: #0077b6;
    color: white;
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
        transform: scale(1.1);
    }

    ${({ expanded }) =>
        expanded &&
        css`
            background-color: #1d3557;
        `}
`;

const FabItem = styled.button`
    width: ${ACTION_FAB_HEIGHT};
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: #fcbf49;
    color: white;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    margin-bottom: 0.5rem;

    &:hover {
        transform: scale(1.1);
    }

    ${({ expanded, index }) =>
        expanded
            ? css`
                  transform: translate(0, 0);
                  opacity: 1;
              `
            : css`
                  transform: translate(
                      0,
                      calc(${index} * ${ACTION_FAB_HEIGHT})
                  );
                  opacity: 0;
              `}
`;

const ExpandableFab = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleFabClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <FabWrapper>
            <FabItem index={1} expanded={isExpanded}>
                1
            </FabItem>
            <FabItem index={2} expanded={isExpanded}>
                2
            </FabItem>
            <FabButton expanded={isExpanded} onClick={handleFabClick}>
                {isExpanded ? '-' : '+'}
            </FabButton>
        </FabWrapper>
    );
};

export default ExpandableFab;
