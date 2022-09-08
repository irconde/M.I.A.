import { ReactComponent as InvertIconComponent } from './invert.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledInvertIcon = styled(InvertIconComponent).attrs(iconSize)`
    ${iconColor}
`;
