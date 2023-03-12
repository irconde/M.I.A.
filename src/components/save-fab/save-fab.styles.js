import styled, { css } from 'styled-components';

const FAB_HEIGHT = '4rem';
const ACTION_FAB_HEIGHT = '3.5rem';

export const FabWrapper = styled.div`
    position: absolute;
    bottom: ${({ show }) => (show ? '5%' : '-100%')};
    transition: bottom 200ms;
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
    background-color: ${({ enabled }) => (enabled ? '#367eff' : '#252525')};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    z-index: 5;
    border: none;
    outline: none;

    &:hover {
        background: ${({ expanded, enabled }) =>
            expanded
                ? 'rgba(57,82,128,0.88)'
                : enabled
                ? '#2B65CE'
                : '#4B4B4B'};
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

    :hover {
        :before {
            width: 90px;
            height: 20px;
            position: absolute;
            right: 110%;
            white-space: nowrap;
            padding: 1px 9px 2px;
            border-radius: 3px;
            box-shadow: 0 1px 2px 0 black;
            background-color: #fff;
            color: #367eff;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        background-color: #2b65ce;
    }

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

export const SaveFabBtn = styled(FabItem)`
    :hover {
        :before {
            content: 'Save changes';
        }
    }
`;

export const SaveAsFabBtn = styled(FabItem)`
    :hover {
        :before {
            content: 'Save to new file';
        }
    }
`;
