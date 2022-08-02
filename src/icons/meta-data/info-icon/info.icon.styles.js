import { ReactComponent as InfoIconComponent } from './info.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledInfoIcon = styled(InfoIconComponent).attrs(iconSize)`
    align-self: center;
    cursor: pointer;
    vertical-align: text-top;
    ${iconColor}
`;
