import styled, { css } from 'styled-components';
import { colors, sideMenuWidth } from '../../../utils/enums/Constants';

export const SideMenuButtonContainer = styled.div`
    width: ${sideMenuWidth}px;
    display: flex;
    margin-top: auto;
    align-items: center;
    background-color: ${colors.BLUE};
    box-shadow: 0.1rem -0.4rem 2rem 0.2rem rgb(0 0 0 / 50%);
    font-size: 16px;
    height: 56px;
    z-index: 1;
    cursor: pointer;
    ${({ disabled }) =>
        disabled &&
        css`
            opacity: 0.4;
            pointer-events: none;
            cursor: default;
        `}
    p {
        flex: 1;
        text-transform: uppercase;
        text-align: center;
        color: white;
    }
`;

export const SaveButtonText = styled.p`
    width: 49px;
    font-family: 'Noto Sans JP', sans-serif;
    font-size: medium;
`;

const SideMenuBtn = styled.button`
    height: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    outline: none;
    transition: background-color 100ms;
    background-color: inherit;
    padding: 0;

    :hover {
        background-color: #2658b2;
    }
`;

export const SaveAsButtonContainer = styled(SideMenuBtn)`
    width: 61px;
`;

export const SaveButtonContainer = styled(SideMenuBtn)`
    width: 175px;
    box-sizing: content-box;
    border-right: 2px solid #2a62c6;
`;

export const SaveIconContainer = styled.div`
    display: flex;
    gap: 18px;
    align-items: center;
`;
