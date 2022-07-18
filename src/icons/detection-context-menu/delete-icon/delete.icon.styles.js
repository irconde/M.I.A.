import styled from 'styled-components';
import { ReactComponent as DeleteIconComponent} from "./delete.icon.svg";

export const StyledDeleteIcon = styled(
    DeleteIconComponent
).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
    pathColor: props.pathColor || '#464646',
    fillColor: props.fillColor || '#000000',
}))`
    align-self: center;
    cursor: pointer;
`;