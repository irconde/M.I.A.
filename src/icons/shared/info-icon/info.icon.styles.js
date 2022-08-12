import { ReactComponent as InfoIconComponent } from './info.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../24px.icon.styles';

export const StyledInfoIcon = styled(InfoIconComponent).attrs(iconSize)`
    vertical-align: text-top;
    ${iconColor}
`;
