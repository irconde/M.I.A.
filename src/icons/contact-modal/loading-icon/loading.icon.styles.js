import styled from 'styled-components';
import { ReactComponent as LoadingIconComponent } from './loading.icon.svg';

export const StyledLoadingIcon = styled(LoadingIconComponent).attrs(
    (props) => ({
        height: props.height || '24px',
        width: props.width || '24px',
    })
)`
    fill: ${(props) => props.color || 'white'};
`;
