import styled from 'styled-components';
import { ReactComponent as CloudIconComponent } from './cloud.icon.svg';

export const IconWrapper = styled.div`
    align-self: center;
    padding-inline: 0.25rem;
`;
export const CloudIcon = styled(CloudIconComponent)`
    margin: 0.3rem;
    margin-right: 1rem;
    display: flex;
    float: left;
    fill: ${(props) => (props.enabled ? '#ffffff' : '#9d9d9d')};
`;
