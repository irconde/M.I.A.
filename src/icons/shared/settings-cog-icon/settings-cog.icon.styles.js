import styled from 'styled-components';
import { ReactComponent as SettingsCogIconComponent } from './settings-cog.icon.svg';

export const StyledCogWheelIcon = styled(SettingsCogIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    fill: ${(props) => props.color};
    margin: auto 0.75rem;
    cursor: pointer;
`;

export const CogIconWrapper = styled.div`
    width: fit-content;
    height: fit-content;
    display: flex;
`;
