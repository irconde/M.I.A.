import styled from 'styled-components';
import { ReactComponent as OpenIconComponent } from './open.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledOpenIcon = styled(OpenIconComponent).attrs(iconSize)`
    ${iconColor}
`;
