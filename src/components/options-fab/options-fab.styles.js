import styled from 'styled-components';
import { SpeedDial } from '@mui/material';

export const OptionsButtonWrapper = styled(SpeedDial)`
    width: fit-content;
    position: absolute;
    right: 16rem;
    bottom: 5%;
    display: flex;
    justify-content: center;
    align-items: center;

    &.MuiSpeedDial-root .MuiFab-root {
        background-color: #313131;
        border: 1px solid #414141;
    }
`;
