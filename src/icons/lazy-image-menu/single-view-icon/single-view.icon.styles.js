import styled from 'styled-components';
import { ReactComponent as SingleViewIconComponent } from './single-view.icon.svg';

export const StyledSingleViewIcon = styled(SingleViewIconComponent).attrs(
    (props) => ({
        width: props.width || '20px',
        height: props.height || '20px',
    })
)`
    align-self: center;
    fill: ${(props) => props.color};
    margin-right: 4px;
    margin-left: 4px;
`;
