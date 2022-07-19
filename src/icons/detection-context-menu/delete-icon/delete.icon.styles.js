import styled from 'styled-components';
import { ReactComponent as DeleteIconComponent} from "./delete.icon.svg";

export const StyledDeleteIcon = styled(
    DeleteIconComponent
).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    align-self: center;
    cursor: pointer;
    fill: ${(props) => props.color};
`;