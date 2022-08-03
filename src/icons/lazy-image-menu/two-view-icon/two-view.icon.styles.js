import styled from 'styled-components';
import { ReactComponent as TwoViewIconComponent } from './two-view.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledTwoViewIcon = styled(TwoViewIconComponent).attrs(iconSize)`
    ${iconColor}
`;
