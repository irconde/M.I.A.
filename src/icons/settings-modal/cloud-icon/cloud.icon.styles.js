import styled from 'styled-components';
import { ReactComponent as CloudIconComponent } from './cloud.icon.svg';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledCloudIcon = styled(CloudIconComponent).attrs(iconSize)`
    ${iconColor}
`;
