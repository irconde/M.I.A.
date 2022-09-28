import styled from 'styled-components';
import { ReactComponent as ImagesIconComponent } from './images.icon.svg';

export const StyledImagesIcon = styled(ImagesIconComponent).attrs((props) => ({
    height: props.height || '24px',
    width: props.width || '24px',
}))`
    fill: ${(props) => props.color || 'white'};
`;
