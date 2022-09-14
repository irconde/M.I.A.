import styled from 'styled-components';
import { Fab, SpeedDial } from '@mui/material';

const noSelectGrey = '#313131';
const selectedBlue = '#367eff';

export const ImageToolsButtonWrapper = styled(SpeedDial)`
    width: fit-content;
    position: absolute;
    right: 16rem;
    bottom: 5%;
    display: ${(props) => (props.$show ? 'flex' : 'none')};
    justify-content: center;
    align-items: center;

    opacity: ${(props) => (props.$fabOpacity ? '100%' : '28%')};
    animation: fadein ${(props) => (props.$fabOpacity ? '2s' : '0.75s')}; /* fade component in so cornerstone can load */
    pointer-events: ${(props) => (props.$fabOpacity ? 'auto' : 'none')};

    -webkit-transition: all 0.3s ease-in;
    -moz-transition: all 0.3s ease-in;
    -o-transition: all 0.3s ease-in;
    -ms-transition: all 0.3s ease-in;
    transition: all 0.3s ease-in;

    @keyframes fadein {
        from {
            opacity: 0;
        }
        to {
            opacity: ${(props) => (props.$fabOpacity ? '1' : '0.28')};
        }
    }

    &.MuiSpeedDial-root .MuiFab-root {
        background-color: ${noSelectGrey};
        border: 1px solid #414141;

        box-shadow: 0rem 0.17rem 0.6rem 0.1rem rgba(0, 0, 0, 0.6);

        &:hover {
            cursor: pointer;
        }

        &&.MuiSpeedDialAction-fab {
            background-color: ${(props) =>
                props.invert ? selectedBlue : noSelectGrey};
        }
    }
`;

export const ImageToolsWrapper = styled.div`
    width: fit-content;
    position: absolute;
    right: 16rem;
    bottom: 5%;
    display: ${(props) => (props.show ? 'flex' : 'none')};
    justify-content: center;
    align-items: center;
    flex-direction: column-reverse;

    opacity: ${(props) => (props.fabOpacity ? '100%' : '28%')};
    animation: fadein ${(props) => (props.fabOpacity ? '2s' : '0.75s')}; /* fade component in so cornerstone can load */
    pointer-events: ${(props) => (props.fabOpacity ? 'auto' : 'none')};

    -webkit-transition: all 0.3s ease-in;
    -moz-transition: all 0.3s ease-in;
    -o-transition: all 0.3s ease-in;
    -ms-transition: all 0.3s ease-in;
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
        background-color: ${(props) =>
            props.$invert ? selectedBlue : noSelectGrey};
        margin-bottom: 0.5rem;
        border: 1px solid #414141;
        box-shadow: 0rem 0.17rem 0.6rem 0.1rem rgba(0, 0, 0, 0.6);

        &:hover {
            cursor: pointer;

            &.blue {
                background-color: #6199fd;
            }

            &.grey {
                background-color: #5e5e5e;
            }
        }
    }
`;

export const SlideButton = styled(Fab)`
    background-color: ${noSelectGrey};
`;
