import { ReactComponent as EyeOpenIconComponent } from './visibility-on.icon.svg';
import styled from 'styled-components';

export const StyledVisibilityOnIcon = styled(EyeOpenIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;
