import { ReactComponent as CodeBracketsIconComponent } from './code-brackets.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledCodeBracketsIcon = styled(CodeBracketsIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;
