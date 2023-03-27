import styled, { keyframes } from 'styled-components';
import { ReactComponent as SpinnerIconComponent } from './spinner.icon.svg';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const StyledSpinnerIcon = styled(SpinnerIconComponent).attrs(
    (props) => ({
        height: props.height || '24px',
        width: props.width || '24px',
    })
)`
    fill: ${(props) => props.color || 'white'};
    animation: ${rotate} 0.75s linear infinite;
`;
