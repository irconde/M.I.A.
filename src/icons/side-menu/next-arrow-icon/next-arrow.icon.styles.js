import { ReactComponent as RightArrowIconComponent } from './next-arrow.icon.svg';
import styled from 'styled-components';

export const StyledNextArrowIcon = styled(RightArrowIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    fill: ${(props) => props.color};
`;
