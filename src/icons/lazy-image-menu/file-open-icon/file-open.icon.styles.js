import styled from 'styled-components';
import { ReactComponent as FileOpenIconComponent } from './file-open.icon.svg';

export const StyledFileOpenIcon = styled(FileOpenIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    align-self: center;
    fill: ${(props) => props.color};
    float: left;
    display: flex;
    align-items: center;
    margin-right: 10px;
`;
