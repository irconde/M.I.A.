import styled from 'styled-components';
import { sideMenuPaddingTop, sideMenuWidth } from '../../utils/enums/Constants';

export const SideMenuContainer = styled.div`
    -webkit-transition: all 0.3s ease-in;
    -moz-transition: all 0.3s ease-in;
    -o-transition: all 0.3s ease-in;
    -ms-transition: all 0.3s ease-in;
    transition: ${(props) =>
        props.collapsedSideMenu ? 'none' : 'all 0.3s ease-in'};
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

export const EyeIconWrapper = styled.span`
    height: 20px;
    width: 20px;
    margin-right: 1rem;
    margin-left: auto;
    cursor: pointer;
`;
