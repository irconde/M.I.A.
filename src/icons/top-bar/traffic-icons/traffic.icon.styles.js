import styled from 'styled-components';
import { ReactComponent as DownloadIconComponent } from './svgs/traffic-download.icon.svg';
import { ReactComponent as UploadIconComponent } from './svgs/traffic-upload.icon.svg';
import { ReactComponent as DownloadUploadIconComponent } from './svgs/traffic-download-upload.icon.svg';
import { ReactComponent as NoTransmissionIconComponent } from './svgs/traffic-no-transmission.icon.svg';
import { iconColor } from '../../shared/24px.icon.styles';

const trafficIconDimen = (props) => ({
    width: props.width || '32px',
    height: props.height || '32px',
});

export const StyledDownloadIcon = styled(DownloadIconComponent).attrs(
    trafficIconDimen
)`
    ${iconColor}
`;

export const StyledUploadIcon = styled(UploadIconComponent).attrs(
    trafficIconDimen
)`
    ${iconColor}
`;

export const StyledDownloadUploadIcon = styled(
    DownloadUploadIconComponent
).attrs(trafficIconDimen)`
    ${iconColor}
`;

export const StyledNoTransmissionIcon = styled(
    NoTransmissionIconComponent
).attrs(trafficIconDimen)`
    ${iconColor}
`;
