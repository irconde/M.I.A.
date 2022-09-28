import styled from 'styled-components';
import { Button, TextField } from '@mui/material';

export const StyledModal = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 430px;
    background-color: #303030;
    padding: 1.5rem;
    box-shadow: 0 1px 22px 0 rgba(0, 0, 0, 0.74);
    border: solid 1px #464646;
`;

export const ModalTitle = styled.h2`
    font-family: Noto Sans JP, serif;
    font-size: 17px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: justify;
    color: #fafafa;
    border-bottom: 1px solid #4e4e4e;
    padding-block: 1rem;
    margin: 0;
`;

export const ModalBody = styled.div`
    display: flex;
    flex-direction: column;
`;

export const ModalSection = styled.div`
    display: flex;
    align-items: center;
    padding-top: 1.5rem;
`;

export const ConfirmButton = styled(Button).attrs(() => ({
    variant: 'contained',
}))`
    align-self: flex-end;
    margin-top: 3rem;
`;

export const StyledInput = styled(TextField).attrs(() => ({
    variant: 'standard',
}))`
    margin-left: 1rem;

    & .MuiInput-input::placeholder {
        font-family: NotoSansJP, sans-serif;
        font-size: 14px;
        font-weight: 300;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
        text-align: justify;
        color: #787878;
    }
`;

export const OutlinedButton = styled(Button).attrs(() => ({
    variant: 'outlined',
}))`
    margin-left: auto;
    color: white;
    border: solid 1px #4e4e4e;
    text-transform: none;
    width: 38%;
`;
