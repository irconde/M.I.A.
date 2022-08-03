import styled from 'styled-components';
import { ReactComponent as ClearIconComponent } from './clear.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledClearIcon = styled(ClearIconComponent).attrs(iconSize)`
    ${iconColor}
`;
