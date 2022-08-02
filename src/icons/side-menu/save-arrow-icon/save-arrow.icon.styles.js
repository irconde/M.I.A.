import { ReactComponent as SaveIconComponent } from './save-arrow.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledSaveArrowIcon = styled(SaveIconComponent).attrs(iconSize)`
    ${iconColor}
`;
