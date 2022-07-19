import { ReactComponent as SaveIconComponent } from './save-arrow.icon.svg';
import styled from 'styled-components';

export const StyledSaveArrowIcon = styled(SaveIconComponent).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
    display: inherit;
`;
