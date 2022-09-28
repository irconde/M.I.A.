import styled from 'styled-components';
import { Button } from '@mui/material';

export const StyledModal = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    border: 2px solid #000;
    background-color: #303030;
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
`;

export const ModalBody = styled.div`
    display: flex;
    flex-direction: column;
`;

export const ModalSection = styled.div`
    display: flex;
`;

export const ConfirmButton = styled(Button)``;
