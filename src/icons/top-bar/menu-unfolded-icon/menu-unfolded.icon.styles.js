import styled from 'styled-components';
import { ReactComponent as MenuUnfoldedIconComponent } from './menu-unfolded.icon.svg';

export const StyledMenuUnfoldedIcon = styled(MenuUnfoldedIconComponent).attrs(
    (props) => ({
        height: props.height || '24px',
        width: props.width || '24px',
    })
)`
    fill: ${(props) => props.color || 'white'};
`;
