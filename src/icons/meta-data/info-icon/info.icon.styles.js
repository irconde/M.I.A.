import { ReactComponent as InfoIconComponent } from './info.icon.svg';
import styled from 'styled-components';

export const StyledInfoIcon = styled(InfoIconComponent).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    align-self: center;
    cursor: pointer;
    vertical-align: text-top;
    fill: ${(props) => props.color};
`;
