import styled from 'styled-components';
import { ReactComponent as TwoViewIconComponent } from './two-view.icon.svg';

export const StyledTwoViewIcon = styled(TwoViewIconComponent).attrs(
    (props) => ({
        width: props.width || '20px',
        height: props.height || '20px',
    })
)`
    fill: ${(props) => props.color};
`;
