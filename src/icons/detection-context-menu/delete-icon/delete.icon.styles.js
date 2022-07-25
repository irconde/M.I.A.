import styled from 'styled-components';
import { ReactComponent as DeleteIconComponent } from './delete.icon.svg';

export const StyledDeleteIcon = styled(DeleteIconComponent).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    fill: ${(props) => props.color};
`;
