import styled from 'styled-components';
import { ReactComponent as SingleViewIconComponent } from './single-view.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledSingleViewIcon = styled(SingleViewIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;
