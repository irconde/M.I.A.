import styled from 'styled-components';
import { Fab, SpeedDial, SpeedDialAction, Tooltip } from '@mui/material';
import {
    NEXT_BUTTON_FAB_MARGIN,
    sideMenuWidth,
} from '../../utils/enums/Constants';

const noSelectGrey = '#313131';
const selectedBlue = '#367eff';

// Determine the right position css property based on whether side menu is collapsed.
const getRightPos = ({ $isSideMenuCollapsed }) => {
    let right = NEXT_BUTTON_FAB_MARGIN;
    if (!$isSideMenuCollapsed) {
        right += sideMenuWidth;
    }
    return right;
};

export const ImageToolsWrapper = styled.div`
    width: fit-content;
    position: absolute;
    right: ${getRightPos}px;
    bottom: ${({ $isSideMenuCollapsed }) =>
        $isSideMenuCollapsed
            ? 2.35 * NEXT_BUTTON_FAB_MARGIN
            : NEXT_BUTTON_FAB_MARGIN}px;
    display: ${(props) => (props.show ? 'flex' : 'none')};
    justify-content: center;
    align-items: center;
    flex-direction: column-reverse;

    z-index: 1;
    pointer-events: ${(props) => (props.fabOpacity ? 'pointer' : 'none')};
    transition: all 0.3s ease-in;

    @keyframes fadein {
        from {
            opacity: 0;
        }
        to {
            opacity: ${(props) => (props.fabOpacity ? '1' : '0.28')};
        }
    }
`;

export const ImageToolsButton = styled(Fab)`
    &.MuiButtonBase-root {
        background-color: ${noSelectGrey};
        border: 1px solid #414141;

        box-shadow: 0rem 0.17rem 0.6rem 0.1rem rgba(0, 0, 0, 0.6);

        &:hover {
            cursor: pointer;
            background-color: #5e5e5e;
        }
    }
`;

export const ToolsWrapper = styled.div`
    display: ${(props) => (props.$show ? 'flex' : 'none')};
    flex-direction: column-reverse;
    flex-grow: 1;
    align-items: center;
`;

export const InvertButton = styled(Fab)`
    &.MuiButtonBase-root {
        background-color: ${({ $invert }) =>
            $invert ? selectedBlue : noSelectGrey};
        margin-bottom: 0.5rem;
        border: 1px solid #414141;
        box-shadow: 0rem 0.17rem 0.6rem 0.1rem rgba(0, 0, 0, 0.6);

        &:hover {
            cursor: pointer;
            background-color: ${({ $invert }) =>
                $invert ? '#6199fd' : '#5e5e5e'};
        }
    }
`;

export const SlideButton = styled(Fab)`
    background-color: ${noSelectGrey};
`;

export const StyledSpeedDial = styled(SpeedDial)`
    position: absolute;
    right: ${getRightPos}px;
    bottom: ${({ $isSideMenuCollapsed }) =>
        $isSideMenuCollapsed
            ? 2.35 * NEXT_BUTTON_FAB_MARGIN
            : NEXT_BUTTON_FAB_MARGIN}px;
    display: ${(props) => (props.show ? 'flex' : 'none')};

    pointer-events: ${(props) => (props.fabOpacity ? 'pointer' : 'none')};
    transition: all 0.3s ease-in;

    @keyframes fadein {
        from {
            opacity: 0;
        }
        to {
            opacity: ${(props) => (props.fabOpacity ? '1' : '0.28')};
        }
    }

    & .MuiButtonBase-root {
        background-color: ${({ $invert, $isOpen }) =>
            $isOpen && $invert ? selectedBlue : noSelectGrey};
        border: 1px solid #414141;
        z-index: 1;
        box-shadow: 0rem 0.17rem 0.6rem 0.1rem rgba(0, 0, 0, 0.6);

        &:hover {
            cursor: pointer;
            background-color: ${({ $invert, $isOpen }) =>
                $isOpen && $invert ? '#6199fd' : '#5e5e5e'};
        }
    }

    && .MuiSpeedDial-actions {
        width: 56px;
        padding: 0 0 2.35rem 0;
        display: flex;
        flex-direction: column-reverse;
        align-items: center;
    }
`;

export const StyledAction = styled(SpeedDialAction)`
    &.MuiButtonBase-root {
        width: 100%;
        height: auto;
        aspect-ratio: 1;
        background-color: ${({ $invert }) =>
            $invert ? selectedBlue : noSelectGrey};
        margin-bottom: 0.5rem;
        border: 1px solid #414141;
        box-shadow: 0rem 0.17rem 0.6rem 0.1rem rgba(0, 0, 0, 0.6);

        &:hover {
            cursor: pointer;
            background-color: ${({ $invert }) =>
                $invert ? '#6199fd' : '#5e5e5e'};
        }
    }
`;

export const SpeedDialIconWrapper = styled.div`
    opacity: ${({ $show }) => ($show ? '1' : '0')};
    width: ${({ $show }) => ($show ? '100%' : '0px')};
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 200ms ease-in-out;
    border-radius: 50%;
`;

export const StyledTooltip = styled(Tooltip)`
    &.MuiTooltip-popper {
        opacity: ${({ $show }) => ($show ? '1' : '0')};
    }
`;
