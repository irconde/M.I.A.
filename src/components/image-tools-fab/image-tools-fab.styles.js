import styled from 'styled-components';
import { Slider, SpeedDial, SpeedDialAction, Tooltip } from '@mui/material';
import { NEXT_BUTTON_FAB_MARGIN } from '../../utils/enums/Constants';

const noSelectGrey = '#313131';
const selectedBlue = '#367eff';

// Determine the right position css property based on whether side menu is collapsed.
const getRightPos = ({ $isSideMenuCollapsed }) => {
    let right = NEXT_BUTTON_FAB_MARGIN;
    if (!$isSideMenuCollapsed) {
        right += 10;
    }
    return `${right}rem`;
};

export const SpeedDialWrapper = styled.div`
    display: flex;
    width: fit-content;
    height: 12rem;
    z-index: 1;
    position: absolute;
    right: ${getRightPos};
    bottom: 5%;
    transition: all 0.3s ease-in;

    @keyframes fadein {
        from {
            opacity: 0;
        }
        to {
            opacity: ${(props) => (props.$fabOpacity ? '1' : '0.28')};
        }
    }
`;

export const StyledSpeedDial = styled(SpeedDial)`
    display: ${(props) => (props.$show ? 'flex' : 'none')};
    height: 12rem;
    justify-content: space-between;
    pointer-events: ${(props) => (props.$fabOpacity ? 'pointer' : 'none')};
    transition: all 0.3s ease-in;

    @keyframes fadein {
        from {
            opacity: 0;
        }
        to {
            opacity: ${(props) => (props.$fabOpacity ? '1' : '0.28')};
        }
    }

    & .MuiButtonBase-root {
        background-color: ${({ $invert, $isOpen }) =>
            $isOpen && $invert ? selectedBlue : noSelectGrey};
        border: 1px solid #414141;
        z-index: 1;
        box-shadow: 0 0.17rem 0.6rem 0.1rem rgba(0, 0, 0, 0.6);

        &:hover {
            cursor: pointer;
            background-color: ${({ $invert, $isOpen }) =>
                $isOpen && $invert ? '#6199fd' : '#5e5e5e'};
        }
    }

    && .MuiSpeedDial-actions {
        width: 56px;
        height: 68%;
        justify-content: space-around;
        padding: 0;
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
        background-color: ${({ $active }) =>
            $active ? selectedBlue : noSelectGrey};
        margin: 0;
        border: 1px solid #414141;
        box-shadow: 0 0.17rem 0.6rem 0.1rem rgba(0, 0, 0, 0.6);

        &:hover {
            cursor: pointer;
            background-color: ${({ $active }) =>
                $active ? '#6199fd' : '#5e5e5e'};
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

export const StyledSlider = styled(Slider)`
    &.MuiSlider-root {
        width: 200px;
        color: ${selectedBlue};
    }
`;

export const SliderGroup = styled.div`
    height: 68%;
    width: ${({ $show }) => ($show ? '10rem' : '0')};
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding-right: 1rem;
    transition: width 0.5s ease-in-out;
`;

export const SliderWrapper = styled.div`
    height: 56px;
    display: flex;
    align-items: center;
    opacity: ${({ $show }) => Number($show)};
    transition: opacity 0.2s ease-in;
    pointer-events: ${({ $show }) => ($show ? 'auto' : 'none')};
`;
