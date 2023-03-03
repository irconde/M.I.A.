import styled from 'styled-components';
import { ReactComponent as SpinnerIconComponent } from './spinner.icon.svg';

export const StyledSpinnerIcon = styled(SpinnerIconComponent).attrs(
    (props) => ({
        height: props.height || '24px',
        width: props.width || '24px',
    })
)`
    fill: ${(props) => props.color || 'white'};
`;
