import { ReactComponent as ExclamationPointIconComponent } from './exclamation-point.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledExclamationPointIcon = styled(
    ExclamationPointIconComponent
).attrs(iconSize)`
    ${iconColor}
`;
