import styled from 'styled-components';
import { ReactComponent as DownloadIconComponent } from '../traffic-download.icon.svg';
import { ReactComponent as UploadIconComponent } from '../traffic-upload.icon.svg';
import { ReactComponent as DownloadUploadIconComponent } from '../traffic-download-upload.icon.svg';
import { ReactComponent as NoTransmissionIconComponent } from '../traffic-no-transmission.icon.svg';

export const StyledDownloadIcon = styled(DownloadIconComponent).attrs(
    (props) => ({
        width: props.width || '32px',
        height: props.height || '32px',
    })
)`
    align-self: center;
    fill: ${(props) => props.color};
    margin: 0.75rem;
`;

export const StyledUploadIcon = styled(UploadIconComponent).attrs((props) => ({
    width: props.width || '32px',
    height: props.height || '32px',
}))`
    align-self: center;
    fill: ${(props) => props.color};
    margin: 0.75rem;
`;

export const StyledDownloadUploadIcon = styled(
    DownloadUploadIconComponent
).attrs((props) => ({
    width: props.width || '32px',
    height: props.height || '32px',
}))`
    align-self: center;
    fill: ${(props) => props.color};
    margin: 0.75rem;
`;

export const StyledNoTransmissionIcon = styled(
    NoTransmissionIconComponent
).attrs((props) => ({
    width: props.width || '32px',
    height: props.height || '32px',
}))`
    align-self: center;
    fill: ${(props) => props.color};
    margin: 0.75rem;
`;
