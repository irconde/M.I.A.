import styled from 'styled-components';
import { ReactComponent as ImportIconComponent } from './import.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledImportIcon = styled(ImportIconComponent).attrs(iconSize)`
    ${iconColor}
`;
