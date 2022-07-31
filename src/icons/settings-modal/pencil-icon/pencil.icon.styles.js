import styled from 'styled-components';
import { ReactComponent as PencilIconComponent } from './pencil.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledPencilIcon = styled(PencilIconComponent).attrs(iconSize)`
    ${iconColor}
`;
