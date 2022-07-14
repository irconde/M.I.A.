import { ReactComponent as RightArrowIconComponent } from './right-arrow.icon.svg';
import styled from 'styled-components';

export const StyledRightArrowIcon = styled(RightArrowIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
    display: inherit;
`;
