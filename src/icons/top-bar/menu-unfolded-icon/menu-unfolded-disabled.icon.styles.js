import styled from 'styled-components';
import { ReactComponent as MenuUnfoldedDisabledIconComponent } from './menu-unfolded-disabled.icon.svg';

export const StyledMenuUnfoldedDisabledIcon = styled(
    MenuUnfoldedDisabledIconComponent
).attrs((props) => ({
    height: props.height || '24px',
    width: props.width || '24px',
}))`
    fill: ${(props) => props.color || 'white'};
`;
