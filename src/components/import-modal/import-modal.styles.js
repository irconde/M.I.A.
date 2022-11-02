import styled from 'styled-components';
import { Button, TextField } from '@mui/material';
import { createTheme } from '@mui/material/styles';

export const modalTheme = createTheme({
    palette: {
        primary: {
            light: '#5e97ff',
            main: '#367eff',
            dark: '#2558b2',
            contrastText: '#9d9d9d',
        },
        secondary: {
            light: '#ffffff',
            main: '#fafafa',
            dark: '#9d9d9d',
            contrastText: '#000000',
        },
    },
});

export const StyledModal = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 35vw;
    background-color: #303030;
    padding: 1.5rem;
    box-shadow: 0 1px 22px 0 rgba(0, 0, 0, 0.74);
    border: solid 1px #464646;

    :focus-visible {
        outline: none;
    }
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
    &.MuiButton-root.MuiButton-contained {
        align-self: flex-end;
        margin-top: 3rem;
        width: 45%;
        font-family: Noto Sans JP, sans-serif;
        font-size: 17px;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
        text-align: justify;
        color: ${({ disabled }) => !disabled && '#fff'};
        padding-block: 0.5rem;
        white-space: nowrap;
    }

    & svg {
        fill: ${({ disabled }) => (disabled ? 'rgba(0, 0, 0, 0.26)' : 'white')};
        transition: fill 250ms;
    }
`;

export const StyledInput = styled(TextField).attrs(() => ({
    variant: 'standard',
    color: 'secondary',
}))`
    width: 50%;

    &.MuiFormControl-root {
        margin-left: 1rem;
    }

    & .MuiInput-input {
        color: #fafafa;
    }

    & .MuiInput-root::before {
        border-bottom: 2px solid #939393;
    }

    & .MuiInput-root:hover:not(.Mui-disabled)::before {
        border-bottom: 2px solid #939393;
    }

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
    &.MuiButton-root {
        margin-left: auto;
        color: white;
        border: solid 1px #4e4e4e;
        text-transform: none;
        width: 38%;
    }
`;

export const SaveIconWrapper = styled.span`
    display: flex;
    padding-left: 0.5rem;
`;
