import styled from 'styled-components';
import {
    NEXT_BUTTON_FAB_MARGIN,
    sideMenuWidth,
} from '../../../../utils/enums/Constants';

export const CollapsedButtonContainer = styled.div`
    z-index: 5;
    margin: ${NEXT_BUTTON_FAB_MARGIN}px;
    position: absolute;
    bottom: 0;
    right: 0;

    transition: all 0.3s ease-in;
    transform: ${(props) =>
        `translateY(${props.isCollapsed ? 0 : sideMenuWidth}px)`};

    display: flex;
    justify-content: center;

    opacity: ${(props) => (props.$isFaded ? '38%' : '100%')};
    pointer-events: ${(props) => props.$isFaded && 'none'};

    img {
        height: 2em;
        width: auto;
        margin-right: 0.5em;
    }

    img {
        height: 2em;
        width: auto;
        margin-top: auto;
        margin-bottom: auto;
        transition: all 0.1s ease-in;
    }

    &:hover {
        cursor: pointer;
    }
`;

export const SideMenuButtonContainer = styled.div`
    position: absolute;
    right: 0;
    bottom: 0;
    width: ${() => sideMenuWidth}px;
    display: flex;
    align-items: center;
    align-self: flex-end;
    justify-content: flex-start;
    background-color: transparent;
    box-shadow: 0.1rem -0.4rem 2rem 0.2rem rgb(0 0 0 / 50%);
    font-size: 16pt;
    height: 57px;

    p {
        flex: 1;
        text-transform: uppercase;
        text-align: center;
        color: white;
    }

    img {
        height: 2em;
        width: auto;
        margin-right: 0.5em;
    }
`;
