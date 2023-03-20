import styled from 'styled-components';
import { ReactComponent as ConfirmImportIconComponent } from './confirm-import.icon.svg';

export const StyledConfirmImportIcon = styled(ConfirmImportIconComponent).attrs(
    (props) => ({
        height: props.height || '24px',
        width: props.width || '24px',
    })
)`
    fill: ${(props) => props.color || 'white'};
`;
