import styled from 'styled-components';
import * as constants from '../../utils/enums/Constants';

export const LAZY_SIDE_MENU_WIDTH = 256 + constants.RESOLUTION_UNIT;
export const DEFAULT_IMAGE_WIDTH = '197px';

export const LazyImageMenuContainer = styled.div`
    position: fixed;
    left: 0;
    bottom: 0;
    height: calc(100% - 3.375rem);
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
    padding-top: calc((${LAZY_SIDE_MENU_WIDTH} - ${DEFAULT_IMAGE_WIDTH}) / 2);
    box-sizing: border-box;

    ::-webkit-scrollbar {
        width: 0;
    }

    ::-webkit-scrollbar-thumb {
        background-color: white;
    }
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
    width: ${LAZY_SIDE_MENU_WIDTH};
    height: ${(props) =>
        props.collapsedLazyMenu === true
            ? document.documentElement.clientHeight
            : 'none'};
`;

export const FolderIconWrapper = styled.div`
    margin-right: 10px;
    align-self: center;
    display: flex;
    align-items: center;
`;
