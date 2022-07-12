import styled from 'styled-components';
import { ReactComponent as CloudIconComponent } from './cloud.icon.svg';

export const StyledCloudIcon = styled(CloudIconComponent).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    align-self: center;
    fill: ${(props) => props.color};
`;
