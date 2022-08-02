import styled from 'styled-components';
import { ReactComponent as LazyMenuToggleIconComponent } from './lazy-menu-toggle.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledLazyMenuToggleIcon = styled(
    LazyMenuToggleIconComponent
).attrs(iconSize)`
    align-self: center;
    margin-top: auto;
    margin-bottom: auto;
    transform: rotate(180);
    cursor: pointer;
    ${iconColor}
`;
