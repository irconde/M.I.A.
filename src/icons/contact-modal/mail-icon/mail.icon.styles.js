import styled from 'styled-components';
import { ReactComponent as MailIconComponent } from './mail.icon.svg';

export const StyledMailIcon = styled(MailIconComponent).attrs((props) => ({
    height: props.height || '24px',
    width: props.width || '24px',
}))`
    fill: ${(props) => props.color || 'white'};
`;
