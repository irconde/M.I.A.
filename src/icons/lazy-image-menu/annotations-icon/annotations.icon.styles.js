import styled from 'styled-components';
import { ReactComponent as AnnotationsIconComponent } from './annotations.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledAnnotationsIcon = styled(AnnotationsIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;
