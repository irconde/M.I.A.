import { ReactComponent as SaveIconComponent } from './save-arrow.icon.svg';
import styled from 'styled-components';

export const StyledSaveArrowIcon = styled(SaveIconComponent).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    fill: ${(props) => props.color};
`;
