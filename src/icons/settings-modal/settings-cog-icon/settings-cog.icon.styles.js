import styled from 'styled-components';
import { ReactComponent as SettingsCogIconComponent } from './settings-cog.icon.svg';

export const StyledCogWheelIcon = styled(SettingsCogIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;
