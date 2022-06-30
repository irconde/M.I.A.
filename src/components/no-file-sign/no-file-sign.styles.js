import styled from 'styled-components';
import { ReactComponent as NoFilesIcon } from '../../icons/ic_no_files.svg';

export const NoFileSignWrapper = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    width: auto;
    opacity: 1;
`;
export const StyledNoFilesIcon = styled(NoFilesIcon)`
    opacity: 0.9;
    width: 90%;
    height: 90%;
`;
export const NoFileSignLabel = styled.p`
    font-weight: 500;
    margin-top: 0rem;
    text-align: center;
    width: 100%;
    font-size: 34pt;
    text-transform: uppercase;
    color: #367fff;
`;
