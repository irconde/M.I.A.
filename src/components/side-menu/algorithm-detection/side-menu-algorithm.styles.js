import styled from 'styled-components';
import { detectionStyle } from '../../../utils/enums/Constants';

export const SideMenuAlgorithm = styled.div`
    padding-block: 1rem;
    padding-left: 3rem;
    display: flex;
    align-items: center;
    background-color: ${(props) =>
        props.selected ? detectionStyle.SELECTED_COLOR : ''};
`;
export const SideMenuAlgorithmName = styled.div`
    vertical-align: top;
    font-family: Noto Sans JP;
    cursor: default;
    color: white;
`;
export const CollapsableArrowIconContainer = styled.span`
    height: 1.5rem;
    width: 1.5rem;
    margin-inline: 0.5rem;
    cursor: pointer;
`;
