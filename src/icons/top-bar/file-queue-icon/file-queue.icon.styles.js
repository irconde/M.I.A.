import styled from 'styled-components';
import { ReactComponent as FileQueueIconComponent } from './file-queue.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledFileQueueIcon = styled(FileQueueIconComponent).attrs(
    iconSize
)`
    ${iconColor}
`;
