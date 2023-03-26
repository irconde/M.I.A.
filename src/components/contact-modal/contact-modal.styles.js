import styled from 'styled-components';
import { Button, FormControl, Paper, TextField } from '@mui/material';
import { colors } from '../../utils/enums/Constants';

export const StyledRow = styled.div`
    display: flex;

    margin-top: 32px;

    :first-of-type {
        margin-top: 40px;
    }
`;
export const StyledPaper = styled(Paper).attrs(() => ({
    elevation: 3,
}))`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    outline: none;
    font-family: Noto Sans JP, sans-serif;
    width: 513px;
    height: 602px;
    background-color: #303030;
    padding: 24px 32px 32px 32px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    ${StyledRow} > .MuiFormControl-root:first-of-type {
        margin-left: 16px;
    }

    ${StyledRow} > .MuiFormControl-root:nth-of-type(2) {
        margin-left: 24px;
    }

    ${StyledRow}:last-of-type > .MuiFormControl-root:first-of-type {
        margin-left: 36px;
    }
`;

export const StyledInput = styled(TextField).attrs(() => ({
    color: 'secondary',
}))`
    &.MuiFormControl-root {
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
        padding: 0 0 6px 0;
    }

    & .MuiInput-root::before {
        border-bottom: 2px solid #4e4e4e;
    }

    & .MuiInput-root:hover:not(.Mui-disabled)::before {
        border-bottom: 2px solid #4e4e4e;
    }

    & .MuiInput-input::placeholder,
    textarea::placeholder {
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

export const CloseIconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;

    cursor: pointer;
`;

export const ModalIcon = styled.span`
    width: 20px;
    aspect-ratio: 1;
    display: flex;
    align-items: start;
`;

export const ContactTitle = styled.h2`
    font-family: NotoSansJP, sans-serif;
    font-size: 16px;
    font-weight: 500;
    font-stretch: normal;
    font-style: normal;
    line-height: 0.81;
    letter-spacing: normal;
    display: flex;
    color: #fafafa;
    padding-bottom: 24px;
    border-bottom: 1px solid #4e4e4e;
    margin: 0;
`;

export const SubmitButton = styled(Button)`
    &.MuiButton-root {
        align-self: end;
        margin-top: auto;
        width: 240px;
        height: 50px;
        font-size: 16px;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
        text-align: justify;
        display: flex;
        gap: 18px;
        background: ${({ $success, $submitting }) =>
            $submitting || $success === null
                ? colors.BLUE
                : $success
                ? colors.GREEN
                : colors.RED};
        color: ${colors.WHITE};

        transition: filter 200ms;
        pointer-events: ${({ $success }) => ($success ? 'none' : 'unset')};

        :hover {
            background: ${({ $success, $submitting }) =>
                $submitting || $success === null
                    ? colors.BLUE
                    : $success
                    ? colors.GREEN
                    : colors.RED};
            background: #2658b2;
        }
    }
`;

export const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

export const FormField = styled(FormControl)`
    width: ${({ width }) => width || '100%'};
`;

export const RequiredLabel = styled.p`
    text-align: end;
    padding: 0;
    margin: 0;
    color: #367eff;
    width: 100%;
    font-size: 13px;
    margin-top: 8px;
`;
