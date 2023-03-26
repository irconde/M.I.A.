import styled from 'styled-components';
import { ReactComponent as MailIconComponent } from './mail.icon.svg';

export const StyledMailIcon = styled(MailIconComponent).attrs((props) => ({
    height: props.height || '24px',
    width: props.width || '24px',
    viewBox: '0 0 24 24',
}))`
    fill: ${(props) => props.color || 'white'};
`;
