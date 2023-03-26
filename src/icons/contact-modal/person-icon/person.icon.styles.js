import styled from 'styled-components';
import { ReactComponent as PersonIconComponent } from './person.icon.svg';

export const StyledPersonIcon = styled(PersonIconComponent).attrs((props) => ({
    height: props.height || '24px',
    width: props.width || '24px',
}))`
    fill: ${(props) => props.color || 'white'};
`;
