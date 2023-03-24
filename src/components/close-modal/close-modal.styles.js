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
    padding: 22px 30px 32px 31px;
    box-sizing: border-box;
    box-shadow: 0 1px 22px 0 rgba(0, 0, 0, 0.74);
    border: solid 1px #464646;
    background-color: #303030;
    font-family: Noto Sans JP, sans-serif;
    display: flex;
    flex-direction: column;
`;

export const CloseModalTitle = styled.div`
    color: #fafafa;
    display: flex;
    width: 100%;
    border-bottom: 1px solid #4e4e4e;
    padding-bottom: 24px;
`;

export const CloseIconWrapper = styled.button`
    margin-left: auto;
    display: flex;
    cursor: pointer;
    background: none;
    outline: none;
    border: none;
    padding: 0;
`;

export const Content = styled.div`
    display: flex;
    align-items: center;
    margin-top: 30px;
`;

export const IconWrapper = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: baseline;

    svg:first-child {
        margin-left: -9px;
    }

    svg:nth-child(2),
    svg:nth-child(3) {
        position: absolute;
        bottom: 0;
        right: 0;
        z-index: 10;
    }

    svg:nth-child(3) {
        bottom: -1px;
        right: 1px;
        z-index: 9;
    }
`;

export const ContentText = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-left: 20px;
`;

export const ModalText = styled.div`
    color: #e1e1e1;
    margin: 0;
    padding: 0;
`;

export const ModalButtonRow = styled.div`
    display: flex;
    flex-direction: row;
    margin-top: auto;
    margin-left: 108px;
`;
export const ModalButton = styled(Button)`
    &.MuiButton-root {
        font-family: NotoSansJP, sans-serif;
        font-size: 16px;
        color: #ffffff;
        width: 95px;
        border-radius: 4px;
        border: solid 1px #4e4e4e;

        &:first-child {
            width: 144px;
            :hover {
                border: solid 1px #2658b2;
            }
        }

        &:nth-child(2) {
            margin-right: 18px;
            margin-left: 56px;
            :hover {
                border: solid 1px #2658b2;
            }
        }

        &:nth-child(3) {
            background-color: #367eff;
            :hover {
                background-color: #2658b2;
            }
        }
    }
`;
