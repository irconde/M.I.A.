import { ReactComponent as ExclamationPointIconComponent } from './exclamation-point.icon.svg';
import styled from 'styled-components';

export const StyledExclamationPointIcon = styled(
    ExclamationPointIconComponent
).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;
