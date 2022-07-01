import styled from 'styled-components';
import { sideMenuWidth } from '../../../../utils/Constants';

export const CollapsedButtonContainer = styled.div`
    width: 75px;
    margin: 50px;
    position: absolute;
    bottom: 0;
    right: 0;

    transition: all 0.3s ease-in;
    transform: ${(props) =>
        `translateY(${props.isCollapsed ? 0 : sideMenuWidth}px)`};

    display: flex;
    justify-content: center;

    opacity: ${(props) => (props.enabled ? '100%' : '38%')};

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
    width: 100%;
    display: flex;
    align-items: center;
    align-self: flex-end;
    justify-content: center;
    background-color: ${(props) => (props.enabled ? '#367eff' : '#252525')};
    box-shadow: 0.1rem -0.4rem 2rem 0.2rem rgb(0 0 0 / 50%);
    font-size: 12pt;
    height: 75px;
    cursor: ${(props) => (props.enabled ? 'pointer' : 'normal')};

    opacity: ${(props) => (props.enabled ? '100%' : '38%')};

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
