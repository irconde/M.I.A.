import styled from 'styled-components';
import { Button } from '@mui/material';

export const ModalWrapper = styled.div`
    position: absolute;
    width: 100vw;
    height: 100vh;
    display: grid;
    place-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    transition: opacity 200ms;
    z-index: 1000;

    :empty {
        visibility: hidden;
        opacity: 0;
    }
`;

export const CloseModalBody = styled.div`
    width: 572px;
    height: 307px;
    // padding: 22px 30px 32px 31px;
    box-shadow: 0 1px 22px 0 rgba(0, 0, 0, 0.74);
    border: solid 1px #464646;
    background-color: #303030;
    font-family: Noto Sans JP, sans-serif;
`;

export const CloseModalTitle = styled.div`
    width: 191px;
    color: #fafafa;
    position: relative;
    top: 22px;
    left: 31px;
`;

export const CloseIconWrapper = styled.div`
    position: relative;
    left: 524px;
    cursor: pointer;
    width: min-content;
`;

export const Divider = styled.div`
    position: relative;
    width: 510px;
    border: solid 0.5px #4e4e4e;
    left: 31px;
    top: 22px;
`;

export const Content = styled.div`
    display: flex;
    align-items: center;
    margin: 52px 30px 32px 31px;
`;

export const IconWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: baseline;
`;

export const ContentText = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-left: -43px;
`;

export const ModalText = styled.div`
    color: #e1e1e1;
    margin-bottom: 10px;
`;

export const ModalButtonRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
`;
export const ModalButton = styled(Button)`
    &.MuiButton-root {
        font-family: NotoSansJP, sans-serif;
        font-size: 16px;
        color: #ffffff;
        width: 95px;
        height: 42px;
        margin-top: 14px;
        border-radius: 4px;
        border: solid 1px #4e4e4e;

        &:first-child {
            width: 144px;
        }

        &:nth-child(2) {
            margin-right: 18px;
            margin-left: 56px;
        }

        &:nth-child(3) {
            margin-right: 30px;
        }

        :hover {
            background-color: #2658b2;
        }
    }
`;
