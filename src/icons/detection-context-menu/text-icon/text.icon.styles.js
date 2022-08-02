import styled from 'styled-components';
import { ReactComponent as TextIconComponent } from './text.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledTextIcon = styled(TextIconComponent).attrs(iconSize)`
    ${iconColor}
`;
