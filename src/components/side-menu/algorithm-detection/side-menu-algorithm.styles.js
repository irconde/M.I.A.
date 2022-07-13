import styled from 'styled-components';
import { detectionStyle } from '../../../utils/Constants';

export const SideMenuAlgorithm = styled.div`
    padding-block: 0.75rem;
    background-color: ${(props) =>
        props.selected ? detectionStyle.SELECTED_COLOR : ''};
`;
export const SideMenuAlgorithmName = styled.div`
    vertical-align: top;
    font-family: Noto Sans JP;
    display: inline-block;
    margin: auto;
    cursor: default;
    padding-top: 0.2rem;
    color: ${(props) => (props.anyDetectionVisible ? 'white' : 'gray')};
`;
export const EyeIconWrapper = styled.span`
    height: 20px;
    width: 20px;
    display: inline-block;
    float: right;
    margin-right: 1rem;
    padding-top: 0.2rem;
`;
