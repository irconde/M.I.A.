import { ReactComponent as ExpandArrowIconComponent } from './expand-arrow.icon.svg';
import styled from 'styled-components';

export const StyledExpandArrowIcon = styled(ExpandArrowIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
    transform: rotate(${(props) => (props.expanded ? '90' : '0')}deg);
`;
