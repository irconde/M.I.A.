import styled from 'styled-components';
import { ReactComponent as PersonIconComponent } from './person.icon.svg';

export const StyledPersonIcon = styled(PersonIconComponent).attrs((props) => ({
    height: props.height || '24px',
    width: props.width || '24px',
    viewBox: '0 0 24 24',
}))`
    fill: ${(props) => props.color || 'white'};
`;
