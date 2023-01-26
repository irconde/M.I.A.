import styled from 'styled-components';
import { ReactComponent as ChatIconComponent } from './chat.icon.svg';

export const StyledChatIcon = styled(ChatIconComponent).attrs((props) => ({
    height: props.height || '24px',
    width: props.width || '24px',
}))`
    fill: ${(props) => props.color || 'white'};
`;
