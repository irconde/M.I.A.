import styled from 'styled-components';
import { ReactComponent as SaveIconComponent } from './save.icon.svg';

export const StyledSaveIcon = styled(SaveIconComponent).attrs((props) => ({
    height: props.height || '24px',
    width: props.width || '24px',
}))`
    fill: ${(props) => props.color || 'white'};
`;
