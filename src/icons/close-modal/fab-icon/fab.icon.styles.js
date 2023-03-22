import styled from 'styled-components';
import { ReactComponent as FabIconComponent } from './fab.icon.svg';

export const StyledFabIcon = styled(FabIconComponent).attrs((props) => ({
    height: props.height || '24px',
    width: props.width || '24px',
}))`
    fill: ${(props) => props.color || 'white'};

    position: relative;
    top: 5px;
    left: -32px;
`;
