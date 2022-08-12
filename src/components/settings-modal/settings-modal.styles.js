import styled from 'styled-components';
import {
    Box,
    Button,
    createTheme,
    Divider,
    FormControl,
    FormGroup,
    Paper,
    Select,
    Switch,
    Tab,
    Tabs,
    TextField,
} from '@mui/material';

import GUIicon from '../../../public/app_icon_192.png';

const GREY_COLOR = '#9d9d9d';

export const modalTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            light: '#5e97ff',
            main: '#367eff',
            dark: '#2558b2',
            contrastText: '#9d9d9d',
        },
        secondary: {
            light: '#ffffff',
            main: '#fafafa',
            dark: '#9d9d9d',
            contrastText: '#000000',
        },
    },
    zIndex: {
        modal: 3,
    },
    transitions: {
        duration: {
            shortest: 150,
            shorter: 200,
            // most basic recommended timing
            standard: 300,
            // this is to be used in complex animations
            complex: 375,
            // recommended when something is entering screen
            enteringScreen: 225,
            // recommended when something is leaving screen
            leavingScreen: 195,
        },
    },
});

export const StyledPaper = styled(Paper).attrs(() => ({
    elevation: 3,
}))`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #1f1f1f;
    outline: none;
    font-family: Noto Sans JP;
    width: 30vw;
    min-width: 32rem;
    max-width: 40rem;
    padding: 2rem;
`;

export const ModalRoot = styled.div`
    flex-grow: 1;
    height: 37rem;
`;

export const SettingsHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 1rem 0;
`;

export const IconWrapper = styled.div`
    align-self: center;
    padding-inline: 0.5rem;
`;

export const LeftAlignedWrapper = styled.div`
    margin: 0.3rem;
    margin-right: 1rem;
    display: flex;
`;

export const StyledDivider = styled(Divider).attrs(() => ({
    variant: 'middle',
}))`
    margin: auto;
`;

export const ScrollableContainer = styled.div`
    overflow-y: auto;
    height: ${(props) => `${props.height}%`};
    padding: 0.5rem 0 0.25rem;
`;

export const SettingOptionTitle = styled.p`
    font-family: Noto Sans JP;
    font-size: 1rem;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #fff;
    margin-bottom: 0.25rem;
    margin-top: 0.75rem;
`;

export const SettingDescription = styled.p`
    color: ${GREY_COLOR};
    font-size: 12px;
    margin: 0;
    margin-bottom: 2rem;
`;

export const RemoteWorkContainer = styled(SettingsHeader)`
    margin: 0;
`;

export const SwitchWrapper = styled.div`
    align-self: flex-end;
`;

export const SettingsRow = styled(SettingsHeader)`
    margin-top: 2rem;
    margin-bottom: 0;
`;

export const WorkingDirectory = styled(SettingsHeader)`
    display: flex;
    align-items: center;
    margin: 0;
`;

export const RemoteInputContainer = styled.div`
    display: inline-flex;
    flex-direction: row;
    justify-content: space-between;
    width: 70%;
    align-self: center;
`;

export const AutoConnectContainer = styled.div`
    float: right;
    color: ${GREY_COLOR};
    margin-top: auto;
`;

export const ConnectionButtonSection = styled.div`
    display: flex;
    flex-shrink: 0;
    flex-direction: row;
    margin-block: 16px;
    justify-content: flex-start;
    align-content: center;
    align-items: center;
`;

export const FileManagementSection = styled(SettingsHeader)`
    margin-bottom: 16px;
    margin-top: 32px;
`;

export const FileManagementItem = styled.div`
    display: flex;
    justify-content: flex-start;
    flex-direction: row;
    flex-grow: 1;
    width: 33%;
`;

export const SaveSettingsButton = styled(Button).attrs(() => ({
    variant: 'outlined',
    sx: {
        bgcolor: 'primary.main',
        color: '#ffffff',
        marginTop: 5,
    },
}))`
    width: 35%;
    padding: 10px;
    align-self: flex-end;
`;

export const StyledFormGroup = styled(FormGroup)`
    height: 100%;
`;

export const ConnectionButton = styled(Button).attrs(() => ({
    variant: 'outlined',
    size: 'small',
}))`
    text-transform: none !important;
    padding-inline: ${modalTheme.spacing(3)} !important;
`;

export const StyledSwitch = styled(Switch).attrs(() => ({
    size: 'small',
    color: 'primary',
    name: 'remoteOrLocal',
    inputProps: {
        'aria-label': 'secondary checkbox',
    },
}))``;

export const HostTextField = styled(TextField).attrs(() => ({
    required: true,
    id: 'remoteIp',
    placeholder: 'Host',
    inputProps: {
        size: 30,
        padding: 10,
    },
    variant: 'standard',
}))``;

export const PortTextField = styled(TextField).attrs(() => ({
    required: true,
    id: 'remotePort',
    placeholder: 'Port',
    inputProps: {
        size: 6,
        maxLength: 5,
        inputMode: 'numeric',
        pattern: '[0-9]*',
    },
    variant: 'standard',
}))``;

export const WorkSpaceFormControl = styled(FormControl)`
    width: 70%;

    &.MuiFormControl-root {
        display: flex;
        flex-direction: row;
    }
`;

export const LocalFileOutputField = styled(TextField).attrs(() => ({
    required: true,
    fullWidth: true,
    id: 'localFileOutput',
    placeholder: 'Working directory',
    inputProps: {
        size: '40',
    },
    variant: 'standard',
}))`
    &.MuiFormControl-root {
        width: 70%;
    }
`;

export const SelectFolderButton = styled(Button).attrs(() => ({
    variant: 'outlined',
    size: 'medium',
    id: 'btnFolder',
}))`
    &.MuiButton-root {
        color: #367eff;
        text-transform: none;
        padding-inline: ${modalTheme.spacing(3)};
    }
`;

export const StyledSelect = styled(Select).attrs(() => ({
    displayEmpty: true,
}))``;

export const StandardFormControl = styled(FormControl).attrs(() => ({
    variant: 'standard',
}))``;

export const FileSuffixField = styled(TextField).attrs(() => ({
    required: true,
    id: 'outputSuffix',
    placeholder: 'Filename suffix',
    variant: 'standard',
    inputProps: {
        size: '10',
    },
}))``;

export const DefaultIconWrapper = styled.div`
    height: fit-content;
    width: fit-content;
    display: flex;
    cursor: pointer;
`;

export const ModalTabWrapper = styled.div`
    display: flex;
    align-items: center;
    border-bottom: solid 1px #4e4e4e;
    margin-bottom: 0.5rem;
    height: fit-content;
`;

export const ModalTabContext = styled.div`
    width: 100%;
    height: inherit;
`;

export const ModalTabPanel = styled.div`
    height: 90%;
`;

export const TabList = styled(Tabs).attrs(() => ({
    textColor: 'secondary',
    indicatorColor: 'secondary',
}))`
    width: 95%;
    justify-content: center;
`;

export const StyledTab = styled(Tab)`
    &.MuiButtonBase-root.MuiTab-root {
        text-transform: none;
        font-size: 22px;
        align-items: center;
    }

    &.MuiTab-labelIcon {
        padding: 0 10px;
    }

    &&.Mui-selected {
        && > svg {
            fill: #ffffff;
        }
    }

    && > svg {
        padding-right: 5px;
        padding-bottom: 3px;
    }
`;

export const StyledBox = styled(Box)`
    padding: 2px 0 0;
    height: 95%;
`;

// ---------------- ABOUT TAB -----------------

export const AboutHeader = styled.div`
    display: flex;
    flex-direction: row;
    padding: 10px 0 20px;
    align-items: center;
    height: 14%;
`;

export const AboutHeaderInfo = styled.div`
    flex-direction: column;
    font-family: Noto Sans JP;
    margin: 0 10px 10px;
`;

export const VersionInfo = styled.div`
    font-size: 18px;
    color: #7e7e7e;
`;

export const AboutTitle = styled.div`
    object-fit: contain;
    font-size: 54px;
    font-weight: 400;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #fff;
    flex: auto;
    align-self: center;
    height: fit-content;

    strong {
        font-weight: 900;
    }
`;

export const AppIcon = styled.img.attrs({
    src: `${GUIicon}`,
})`
    height: auto;
    max-width: 100%;
`;

export const AppIconWrapper = styled.div`
    height: 121px;
    width: 121px;
    background: #282828;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const AppSummary = styled.div`
    height: 19.5%;
`;

export const TeamAndLibraryWrapper = styled.div`
    height: 57%;
`;
