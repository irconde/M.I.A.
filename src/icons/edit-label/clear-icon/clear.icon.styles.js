import styled from 'styled-components';
import { ReactComponent as ClearIconComponent } from './clear.icon.svg';

export const StyledClearIcon = styled(ClearIconComponent).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    align-self: center;
    cursor: pointer;
    vertical-align: text-top;
    fill: ${(props) => props.color};
`;
