import styled from 'styled-components';
import { detectionStyle } from '../../../utils/general/Constants';

export const SideMenuDetection = styled.div`
    padding-block: 0.45rem;
    display: flex;
    align-items: center;
    background-color: ${(props) =>
        props.selected ? detectionStyle.SELECTED_COLOR : ''};
`;

export const DetectionColorBox = styled.div`
    width: 10px;
    height: 10px;
    border: 0.0625rem solid rgba(220, 220, 220, 0.4);
    margin-right: 0.75rem;
    margin-left: 2.4rem;
    background-color: ${(props) => props.bgColor || 'black'};
`;

export const SideMenuDetectionText = styled.span`
    text-transform: uppercase;
    font-family: Noto Sans JP;
    cursor: default;
    color: ${(props) => props.color || 'white'};
`;
