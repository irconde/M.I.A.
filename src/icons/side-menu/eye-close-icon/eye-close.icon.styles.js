import { ReactComponent as EyeCloseIconComponent } from './eye-close.icon.svg';
import styled from 'styled-components';

export const StyledEyeCloseIcon = styled(EyeCloseIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;
