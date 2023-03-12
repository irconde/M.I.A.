import styled from 'styled-components';
import { ReactComponent as SaveAsIconComponent } from './save-as.icon.svg';

export const StyledSaveAsIcon = styled(SaveAsIconComponent).attrs((props) => ({
    height: props.height || '24px',
    width: props.width || '24px',
}))`
    fill: ${(props) => props.color || 'white'};
`;
