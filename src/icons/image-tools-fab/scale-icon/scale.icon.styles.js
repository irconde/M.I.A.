import { ReactComponent as ScaleIconComponent } from './scale.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../../shared/24px.icon.styles';

export const StyledScaleIcon = styled(ScaleIconComponent).attrs(iconSize)`
    ${iconColor}
`;
