import styled from 'styled-components';
import * as constants from '../../utils/Constants';

const sideMenuWidth = 256 + constants.RESOLUTION_UNIT;

export const LazyImageMenuContainer = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    height: 100%;
    overflow-x: hidden;
    overflow-y: visible;
    background-color: #292929;
    -webkit-transition: all 0.3s ease-in;
    -moz-transition: all 0.3s ease-in;
    -o-transition: all 0.3s ease-in;
    -ms-transition: all 0.3s ease-in;
    transition: ${(props) =>
        props.collapsedLazyMenu === true ? 'none' : 'all 0.3s ease-in'};
    z-index: 2;
    width: 256px;
    transform: ${(props) => props.translateStyle};
`;

export const LazyImageMenuPadding = styled.div`
    height: ${constants.sideMenuPaddingTop} + ${constants.RESOLUTION_UNIT};
    width: 100%;
`;

export const LazyImagesContainer = styled.div`
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: flex-start;
    width: ${sideMenuWidth};
    height: ${(props) =>
        props.collapsedLazyMenu === true
            ? document.documentElement.clientHeight
            : 'none'};
`;

export const ImagesInWorkspace = styled.p`
    width: 100%;
    height: 20px;
    margin-top: 0;
    font-size: 14px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: -0.58px;
    text-align: center;
    color: #e3e3e3;
    display: flex;
    justify-content: flex-start;
    position: sticky;
    top: 0px;
    background-color: #292929;
    z-index: 1;
    padding: 1rem 0 1rem 1rem;
    box-shadow: ${(props) =>
        props.shouldAddBoxShadow &&
        '0 0.1rem 0.5rem 0.3rem rgba(0, 0, 0, 0.5)'};
`;
