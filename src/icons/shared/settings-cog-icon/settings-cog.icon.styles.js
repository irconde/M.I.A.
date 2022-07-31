import styled from 'styled-components';
import { ReactComponent as SettingsCogIconComponent } from './settings-cog.icon.svg';
import { iconColor, iconSize } from '../24px.icon.styles';

export const StyledCogWheelIcon = styled(SettingsCogIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;
