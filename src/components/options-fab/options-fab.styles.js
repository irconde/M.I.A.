import styled from 'styled-components';
import { SpeedDial } from '@mui/material';

const noSelectGrey = '#313131';
const selectedBlue = '#367eff';

export const OptionsButtonWrapper = styled(SpeedDial)`
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

        &.MuiSpeedDialAction-fab {
            //  background-color: ${(props) =>
                props.invert ? selectedBlue : noSelectGrey};
        }
    }
`;
