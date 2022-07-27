import styled from 'styled-components';
import { ReactComponent as DownloadIconComponent } from '../traffic-download.icon.svg';
import { ReactComponent as UploadIconComponent } from '../traffic-upload.icon.svg';
import { ReactComponent as DownloadUploadIconComponent } from '../traffic-download-upload.icon.svg';
import { ReactComponent as NoTransmissionIconComponent } from '../traffic-no-transmission.icon.svg';

const trafficIconDimen = (props) => ({
    width: props.width || '32px',
    height: props.height || '32px',
});

export const StyledDownloadIcon = styled(DownloadIconComponent).attrs(
    trafficIconDimen
)`
    fill: ${(props) => props.color};
`;

export const StyledUploadIcon = styled(UploadIconComponent).attrs(
    trafficIconDimen
)`
    fill: ${(props) => props.color};
`;

export const StyledDownloadUploadIcon = styled(
    DownloadUploadIconComponent
).attrs(trafficIconDimen)`
    fill: ${(props) => props.color};
`;

export const StyledNoTransmissionIcon = styled(
    NoTransmissionIconComponent
).attrs(trafficIconDimen)`
    fill: ${(props) => props.color};
`;
