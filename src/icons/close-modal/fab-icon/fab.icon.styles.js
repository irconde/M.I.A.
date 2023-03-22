import styled from 'styled-components';
import { ReactComponent as FabIconComponent } from './fab.icon.svg';

export const StyledFabIcon = styled(FabIconComponent).attrs((props) => ({
    height: props.height || '24px',
    width: props.width || '24px',
}))`
    fill: ${(props) => props.color || 'white'};

    position: relative;
    top: ${(props) => (props.color === '#ffffff' ? '5px' : '6px')};
    left: ${(props) => (props.color === '#ffffff' ? '-38px' : '-78px')};
    z-index: ${(props) => (props.color === '#ffffff' ? '10' : '9')};
`;
