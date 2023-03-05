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
            background-color: #395280;
        `}
`;

export const FabItem = styled.button`
    width: ${ACTION_FAB_HEIGHT};
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: #367eff;
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
