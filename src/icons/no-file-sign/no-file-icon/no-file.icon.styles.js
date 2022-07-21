import styled from 'styled-components';
import { ReactComponent as NoFileIconComponent } from './no-file.icon.svg';

export const StyledNoFileIcon = styled(NoFileIconComponent).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    fill: ${(props) => props.color};
`;
