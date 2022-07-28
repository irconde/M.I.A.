import { ReactComponent as CloseIconComponent } from './close.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledCloseIcon = styled(CloseIconComponent).attrs(iconSize)`
    ${iconColor}
`;
