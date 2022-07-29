import styled from 'styled-components';
import { ReactComponent as FileQueueIconComponent } from './file-queue.icon.svg';

export const StyledFileQueueIcon = styled(FileQueueIconComponent).attrs(
    (props) => ({
        width: props.width || '32px',
        height: props.height || '32px',
    })
)`
    fill: ${(props) => props.color};
`;
