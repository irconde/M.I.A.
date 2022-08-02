import { ReactComponent as RightArrowIconComponent } from './next-arrow.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledNextArrowIcon = styled(RightArrowIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;
