import styled from 'styled-components';
import { ReactComponent as SettingsCogIconComponent } from './settings-cog.icon.svg';
import { iconColor, iconSize } from '../24px.icon.styles';

export const StyledCogWheelIcon = styled(SettingsCogIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;

export const CogIconWrapper = styled.div`
    width: fit-content;
    height: fit-content;
    display: flex;
    margin: auto 0.75rem;
    cursor: pointer;
`;
