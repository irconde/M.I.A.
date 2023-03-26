import styled from 'styled-components';
import { ReactComponent as WebsiteIconComponent } from './website.icon.svg';

export const StyledWebsiteIcon = styled(WebsiteIconComponent).attrs(
    (props) => ({
        height: props.height || '24px',
        width: props.width || '24px',
        viewBox: '0 0 24 24',
    })
)`
    fill: ${(props) => props.color || 'white'};
`;
