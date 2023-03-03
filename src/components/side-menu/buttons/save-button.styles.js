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

export const SaveAsButtonContainer = styled.div`
    background-color: #367eff;
    width: 4.5rem;
    height: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const SaveButtonContainer = styled.div`
    // opacity: ${(props) => (props.$isFaded ? '38%' : '100%')};
    background-color: #367eff;
    width: 12rem;
    height: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.1rem;
`;
