import styled from 'styled-components';
import { ReactComponent as WorkIconComponent } from './work.icon.svg';

export const StyledWorkIcon = styled(WorkIconComponent).attrs((props) => ({
    height: props.height || '24px',
    width: props.width || '24px',
}))`
    fill: ${(props) => props.color || 'white'};
`;
