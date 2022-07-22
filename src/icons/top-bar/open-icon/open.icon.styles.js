import styled from 'styled-components';
import { ReactComponent as OpenIconComponent } from './open.icon.svg';

export const StyledOpenIcon = styled(OpenIconComponent).attrs((props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
}))`
    align-self: center;
    fill: ${(props) => props.color};
`;

export const OpenIconWrapper = styled.div`
    margin-right: 0.75rem;
    margin-left: 1.5rem;
    display: inherit;
`;
