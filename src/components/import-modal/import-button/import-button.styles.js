import styled from 'styled-components';
import { Button } from '@mui/material';

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
        background-color: ${({ $success }) => $success && '#3B8226'};
    }

    & svg {
        fill: ${({ disabled }) => (disabled ? 'rgba(0, 0, 0, 0.26)' : 'white')};
        transition: fill 250ms;
    }
`;

export const IconWrapper = styled.span`
    display: flex;
    padding-left: 0.5rem;
`;
