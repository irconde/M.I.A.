import styled from 'styled-components';
import { Button } from '@mui/material';

export const ConfirmButton = styled(Button).attrs(() => ({
    variant: 'contained',
}))`
    &.MuiButton-root.MuiButton-contained {
        align-self: flex-end;
        margin-top: auto;
        margin-bottom: 2px;
        width: 293px;
        height: 50px;
        border-radius: 5px;

        padding: 13px 60px 13px 61px;
        font-family: Noto Sans JP, sans-serif;
        font-size: 17px;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        line-height: normal;
        letter-spacing: normal;
        text-align: justify;
        color: white;
        white-space: nowrap;
        filter: ${({ disabled }) => disabled && 'brightness(60%)'};
        background-color: ${({ $success, disabled }) =>
            disabled ? '#367eff' : $success && '#3B8226'};
    }

    & svg {
        transition: fill 250ms;
    }
`;

export const IconWrapper = styled.span`
    display: flex;
    margin-left: 0.5rem;
`;
