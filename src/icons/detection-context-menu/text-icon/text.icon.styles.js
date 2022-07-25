import styled from 'styled-components';
import { ReactComponent as TextIconComponent } from './text.icon.svg';

export const StyledTextIcon = styled(TextIconComponent).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    fill: ${(props) => props.color};
`;
