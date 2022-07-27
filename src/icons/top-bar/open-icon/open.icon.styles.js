import styled from 'styled-components';
import { ReactComponent as OpenIconComponent } from './open.icon.svg';

export const StyledOpenIcon = styled(OpenIconComponent).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    fill: ${(props) => props.color};
`;
