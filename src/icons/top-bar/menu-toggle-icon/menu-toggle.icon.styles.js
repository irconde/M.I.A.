import styled from 'styled-components';
import { ReactComponent as MenuToggleIconComponent } from './menu-toggle.icon.svg';

export const StyledMenuToggleIcon = styled(MenuToggleIconComponent).attrs(
    (props) => ({
        width: props.width || '32px',
        height: props.height || '32px',
    })
)`
    fill: ${(props) => props.color};
`;
