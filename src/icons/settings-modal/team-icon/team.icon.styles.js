import { ReactComponent as TeamIconComponent } from './team.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledTeamIcon = styled(TeamIconComponent).attrs(iconSize)`
    vertical-align: text-top;
    ${iconColor}
`;
