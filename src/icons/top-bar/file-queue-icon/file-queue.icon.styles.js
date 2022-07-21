import styled from 'styled-components';
import { ReactComponent as FileQueueIconComponent } from './file-queue.icon.svg';

export const StyledFileQueueIcon = styled(FileQueueIconComponent).attrs(
    (props) => ({
        width: props.width || '24px',
        height: props.height || '24px',
    })
)`
    align-self: center;
    fill: ${(props) => props.color};
    margin: 0.75rem;
`;
