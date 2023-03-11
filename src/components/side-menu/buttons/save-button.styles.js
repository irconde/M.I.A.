import styled from 'styled-components';
import { Fab } from '@mui/material';

export const SaveButtonText = styled.p`
    display: contents;
    width: 49px;
    height: 29px;
`;

export const SaveButtonFab = styled(Fab)`
    &.MuiButtonBase-root {
        background-color: ${(props) =>
            props.$enabled ? '#367eff' : '#313131'};
    }
`;

export const SaveAsButtonContainer = styled.div`
    width: 25%;
    height: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${(props) => (props.enabled ? '#367eff' : '#252525')};
    cursor: ${(props) => (props.$isFaded ? 'normal' : 'pointer')};
    pointer-events: ${(props) => (props.$isFaded ? 'none' : 'pointer')};
    opacity: ${(props) => (props.$isFaded ? '38%' : '100%')};

    :hover {
        background-color: #2b65ce;
    }
`;

export const SaveButtonContainer = styled.div`
    background-color: ${(props) => (props.enabled ? '#367eff' : '#252525')};
    cursor: ${(props) => (props.$isFaded ? 'normal' : 'pointer')};
    pointer-events: ${(props) => (props.$isFaded ? 'none' : 'pointer')};
    opacity: ${(props) => (props.$isFaded ? '38%' : '100%')};
    width: 75%;
    height: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.1rem;

    :hover {
        background-color: #2b65ce;
    }
`;
