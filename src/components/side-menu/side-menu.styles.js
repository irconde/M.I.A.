import styled from 'styled-components';
import {
    detectionStyle,
    sideMenuPaddingTop,
    sideMenuWidth,
} from '../../utils/enums/Constants';

export const SideMenuContainer = styled.div`
    -webkit-transition: all 0.3s ease-in;
    -moz-transition: all 0.3s ease-in;
    -o-transition: all 0.3s ease-in;
    -ms-transition: all 0.3s ease-in;
    transition: ${({ collapsedSideMenu }) =>
        collapsedSideMenu ? 'none' : 'all 0.3s ease-in'};
    transform: translate(
        ${(props) => (props.collapsedSideMenu ? sideMenuWidth : 0)}px
    );
    position: fixed;
    right: 0;
`;

export const SideMenuList = styled.div`
    top: 0;
    color: white;
    fill: white;
    width: 100%;
    height: inherit;
    padding-top: ${sideMenuPaddingTop}px;
`;

export const SideMenuListWrapper = styled.div`
    position: absolute;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: #1f1f1f;
    overflow: hidden;
    font-size: 11.5px;
    right: 0;
    width: ${sideMenuWidth}px;
    height: ${(props) => props.height};
`;

export const AlgorithmContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0 0 1.5rem;
`;

export const AlgorithmButtonWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const EyeIconWrapper = styled.span`
    height: 20px;
    width: 20px;
    margin-right: 1rem;
    margin-left: auto;
    cursor: pointer;
`;

export const CollapsableArrowIconContainer = styled.span`
    height: 1.5rem;
    width: 1.5rem;
    margin-inline: 0.5rem;
    cursor: pointer;
`;

export const SideMenuAlgorithm = styled.div`
    padding-block: 1rem;
    padding-left: 3rem;
    display: flex;
    align-items: center;
    background-color: ${({ selected }) =>
        selected ? detectionStyle.SELECTED_COLOR : ''};
`;
export const SideMenuAlgorithmName = styled.div`
    vertical-align: top;
    font-family: Noto Sans JP;
    cursor: default;
    color: white;
    user-select: none;
`;
