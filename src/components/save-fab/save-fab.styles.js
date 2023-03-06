import styled, { css } from 'styled-components';

const FAB_HEIGHT = '4rem';
const ACTION_FAB_HEIGHT = '3.5rem';

export const FabWrapper = styled.div`
    position: absolute;
    bottom: 2rem;
    right: 2rem;
    z-index: 999;
    height: auto;
    display: flex;
    align-items: center;
    flex-direction: column;
`;

export const FabButton = styled.button`
    width: ${FAB_HEIGHT};
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: #367eff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    z-index: 5;
    border: none;

    &:hover {
        transform: scale(1.1);
    }

    ${({ expanded }) =>
        expanded &&
        css`
            background-color: #395280;
        `}
`;

export const FabItem = styled(FabButton)`
    width: ${ACTION_FAB_HEIGHT};
    display: flex;
    margin-bottom: 0.5rem;
    z-index: 3;

    ${({ expanded, index }) =>
        expanded
            ? css`
                  transform: translate(0, 0);
                  opacity: 1;
                  background-color: #367eff;
              `
            : css`
                  transform: translate(0, calc(${index} * 117%));
                  opacity: 0;
              `}
`;
