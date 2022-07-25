import styled from 'styled-components';
import { ReactComponent as MenuToggleIconComponent } from './menu-toggle.icon.svg';

export const StyledMenuToggleIcon = styled(MenuToggleIconComponent).attrs(
    (props) => ({
        width: props.width || '32px',
        height: props.height || '32px',
    })
)`
    align-self: center;
    fill: ${(props) => props.color};
    margin: auto 0;
`;

export const MenuIconWrapper = styled.div`
    margin: 0.5rem 1.5rem 0.5rem -0.5rem;
    cursor: pointer;
`;
