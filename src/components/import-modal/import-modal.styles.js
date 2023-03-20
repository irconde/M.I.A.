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
    width: 513px;
    height: 348px;
    display: flex;
    flex-direction: column;
    background-color: #303030;
    padding: 24px 32px 34px 31px;
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
    flex: 1;
`;

export const ModalSection = styled.div`
    display: flex;
    align-items: center;
    padding-top: 32px;
`;

export const StyledInput = styled(TextField).attrs(() => ({
    variant: 'standard',
    color: 'secondary',
}))`
    width: 266px;

    &.MuiFormControl-root {
        margin-left: 1rem;
    }

    & .MuiInput-input {
        font-size: 13px;
        font-weight: 300;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.46;
        letter-spacing: normal;
        text-align: justify;
        color: #fafafa;
    }

    & .MuiInput-root::before {
        border-bottom: 2px solid #4e4e4e;
    }

    & .MuiInput-root:hover:not(.Mui-disabled)::before {
        border-bottom: 2px solid #4e4e4e;
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
        width: 160px;
        height: 42px;
        font-size: 13px;
        font-weight: 500;
    }
`;
