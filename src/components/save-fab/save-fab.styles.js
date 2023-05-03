import styled, { css } from 'styled-components';
import { colors } from '../../utils/enums/Constants';

const FAB_HEIGHT = '4rem';
const ACTION_FAB_HEIGHT = '3.5rem';
const HOVER_COLOR = '#2658b2';
const FAB_EXPANDED_COLOR = '#395280';

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
    background-color: ${colors.BLUE};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    z-index: 5;
    border: none;
    outline: none;

    ${({ enabled }) =>
        !enabled &&
        css`
            opacity: 0.4;
            pointer-events: none;
            cursor: default;
        `}
    :hover {
        background: ${({ enabled }) => enabled && HOVER_COLOR};
    }
    ${({ expanded }) =>
        expanded &&
        css`
            background-color: ${FAB_EXPANDED_COLOR};
        `}
`;

export const FabBackground = styled.div`
    position: absolute;
    bottom: 0;
    right: 0;
    aspect-ratio: 1;
    height: ${FAB_HEIGHT};
    border-radius: 50%;
    border: none;
    outline: none;
    background-color: #1f1f1f;
`;

export const FabItem = styled(FabButton)`
    width: ${ACTION_FAB_HEIGHT};
    display: flex;
    margin-bottom: 0.5rem;
    z-index: 3;

    &:hover {
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
            color: ${colors.BLUE};
            display: flex;
            justify-content: center;
            align-items: center;
        }

        background-color: ${HOVER_COLOR};
    }

    ${({ expanded, index }) =>
        expanded
            ? css`
                  transform: translate(0, 0);
                  opacity: 1;
                  background-color: ${colors.BLUE};
              `
            : css`
                  transform: translate(0, calc(${index} * 117%));
                  opacity: 0;
              `}
`;
