import { ReactComponent as EyeOpenIconComponent } from './visibility-on.icon.svg';
import styled from 'styled-components';

export const StyledVisibilityOnIcon = styled(EyeOpenIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    fill: ${(props) => props.color};
`;
