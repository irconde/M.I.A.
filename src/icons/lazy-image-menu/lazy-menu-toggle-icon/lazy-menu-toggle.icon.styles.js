import styled from 'styled-components';
import { ReactComponent as LazyMenuToggleIconComponent } from './lazy-menu-toggle.icon.svg';

export const StyledLazyMenuToggleIcon = styled(
    LazyMenuToggleIconComponent
).attrs((props) => ({
    width: props.width || '32px',
    height: props.height || '32px',
}))`
    align-self: center;
    fill: ${(props) => props.color};
    margin-top: auto;
    margin-bottom: auto;
    transform: rotate(180);
    cursor: pointer;
`;
