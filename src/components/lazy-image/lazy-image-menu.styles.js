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
    z-index: ${({ isScrolled }) => (isScrolled ? 1 : 2)};
    width: 256px;
    padding-top: calc((${LAZY_SIDE_MENU_WIDTH} - ${DEFAULT_IMAGE_WIDTH}) / 2);
    box-sizing: border-box;

    /* width */

    ::-webkit-scrollbar {
        width: 9px;
    }

    /* Track */

    ::-webkit-scrollbar-track {
        background: #292929;
    }

    /* Handle */

    ::-webkit-scrollbar-thumb {
        background: #555;
        border-radius: 6px;
        border: solid 1px #4e4e4e;
    }

    /* Handle on hover */

    ::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
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
