import styled from 'styled-components';
import { Paper } from '@mui/material';

export const StyledPaper = styled(Paper).attrs((props) => ({
    elevation: 3,
}))`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #1f1f1f;
    outline: none;
    font-family: Noto Sans JP;
    width: 30vw;
    min-width: 32rem;
    max-width: 40rem;
    padding: 2rem;
`;

export const ModalRoot = styled.div`
    flex-grow: 1;
    height: 37rem;
`;

export const SettingsHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 1rem 0;
`;
