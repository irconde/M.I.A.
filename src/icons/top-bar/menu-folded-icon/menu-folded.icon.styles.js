import styled from 'styled-components';
import { ReactComponent as MenuFoldedIconComponent } from './menu-folded.icon.svg';

export const StyledMenuFoldedIcon = styled(MenuFoldedIconComponent).attrs(
    (props) => ({
        height: props.height || '24px',
        width: props.width || '24px',
    })
)`
    fill: ${(props) => props.color || 'white'};
`;
