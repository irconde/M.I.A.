import styled from 'styled-components';
import { Button } from '@mui/material';

export const ModalWrapper = styled.div`
    position: absolute;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    transition: opacity 200ms;
    z-index: 1000;

    :empty {
        visibility: hidden;
        opacity: 0;
    }
`;

export const CloseModalBody = styled.div`
    display: flex;
    font-family: Noto Sans JP, sans-serif;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #121212;
    background-image: linear-gradient(
        rgba(255, 255, 255, 0.08),
        rgba(255, 255, 255, 0.08)
    );
    width: 25rem;
    height: 10rem;
    padding: 1rem 2rem;
    border-radius: 4px;
    box-shadow: 0px 3px 3px -2px rgb(0 0 0 / 20%),
        0px 3px 4px 0px rgb(0 0 0 / 14%), 0px 1px 8px 0px rgb(0 0 0 / 12%);
`;

export const ModalText = styled.p`
    color: #e1e1e1;
    text-align: center;
`;

export const ModalButtonRow = styled.div`
    display: flex;
    flex-direction: row;
`;
export const ModalButton = styled(Button)`
    &.MuiButton-root {
        background: #367fff;
        color: white;
        width: 6rem;
        height: 3rem;
        margin: 1rem;
        padding: 0.5rem;
        transition: all 0.1s;
        :hover {
            background: #367fff;
            filter: brightness(85%);
        }
    }
`;
