import styled from 'styled-components';
import { ReactComponent as WebsiteIconComponent } from './website.icon.svg';

export const StyledWebsiteIcon = styled(WebsiteIconComponent).attrs(
    (props) => ({
        height: props.height || '24px',
        width: props.width || '24px',
    })
)`
    fill: ${(props) => props.color || 'white'};
`;
