import { ReactComponent as EyeCloseIconComponent } from './visibility-off.icon.svg';
import styled from 'styled-components';

export const StyledVisibilityOffIcon = styled(EyeCloseIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    fill: ${(props) => props.color};
`;
