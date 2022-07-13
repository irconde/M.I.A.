import { ReactComponent as EyeOpenIconComponent } from './eye-open.icon.svg';
import styled from 'styled-components';

export const StyledEyeOpenIcon = styled(EyeOpenIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;
