import styled from 'styled-components';
import { Fab } from '@mui/material';

export const SaveButtonText = styled.p`
    display: contents;
`;

export const SaveButtonFab = styled(Fab)`
    &.MuiButtonBase-root {
        background-color: ${(props) =>
            props.$enabled ? '#367eff' : '#313131'};
    }
`;
