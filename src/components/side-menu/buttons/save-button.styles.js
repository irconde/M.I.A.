import styled, { css } from 'styled-components';
import { colors, sideMenuWidth } from '../../../utils/enums/Constants';

export const SideMenuButtonContainer = styled.div`
    width: ${sideMenuWidth}px;
    display: flex;
    margin-top: auto;
    align-items: center;
    align-self: flex-end;
    justify-content: flex-start;
    background-color: ${colors.BLUE};
    box-shadow: 0.1rem -0.4rem 2rem 0.2rem rgb(0 0 0 / 50%);
    font-size: 20px;
    height: 57px;
    z-index: 1;
    ${({ disabled }) => css`
        opacity: ${disabled && '0.4'};
        pointer-events: ${disabled ? 'none' : 'auto'};
        cursor: ${disabled ? 'normal' : 'pointer'};
    `}
    p {
        flex: 1;
        text-transform: uppercase;
        text-align: center;
        color: white;
    }
`;

export const SaveButtonText = styled.p`
    display: contents;
    width: 49px;
    height: 29px;
`;

export const SaveAsButtonContainer = styled.div`
    width: 60px;
    height: inherit;
    display: flex;
    align-items: center;
    justify-content: center;

    :hover {
        background-color: #2b65ce;
    }
`;

export const SaveButtonContainer = styled.div`
    width: 174px;
    height: inherit;
    display: flex;
    align-items: center;
    justify-content: center;

    :hover {
        background-color: #2b65ce;
    }
`;

export const SaveIconContainer = styled.div`
    display: flex;
    gap: 18px;
`;

export const SaveAsDivider = styled.div`
    width: 2px;
    height: 100%;

    background-color: #2a62c6;
`;
