import { ReactComponent as FileSuffixIconComponent } from './file-suffix.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledFileSuffixIcon = styled(FileSuffixIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;
