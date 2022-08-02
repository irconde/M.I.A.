import styled from 'styled-components';
import { ReactComponent as DeleteIconComponent } from './delete.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledDeleteIcon = styled(DeleteIconComponent).attrs(iconSize)`
    ${iconColor}
`;
