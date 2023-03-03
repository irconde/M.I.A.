import styled from 'styled-components';
import { ReactComponent as MiaLogoIconComponent } from './mia-logo.icon.svg';

export const StyledMiaLogoIcon = styled(MiaLogoIconComponent).attrs(
    (props) => ({
        height: props.height || '24px',
        width: props.width || '24px',
    })
)`
    fill: ${(props) => props.color || 'white'};
`;

export const MiaLogoContainer = styled.div`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
`;
