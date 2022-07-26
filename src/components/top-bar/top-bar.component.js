import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import FileQueueIcon from '../../icons/top-bar/file-queue-icon/file-queue.icon';
import CogWheelIcon from '../../icons/shared/settings-cog-icon/settings-cog.icon';
import MenuToggleIcon from '../../icons/top-bar/menu-toggle-icon/menu-toggle.icon';
import OpenIcon from '../../icons/top-bar/open-icon/open.icon';
import ConnectionStatusIcon from '../../icons/top-bar/connection-status-icons/shared/connection-status.icon';
import TrafficIcon from '../../icons/top-bar/traffic-icons/shared/traffic.icon';
import { getTopBarInfo } from '../../redux/slices/server/serverSlice';
import {
    getFirstDisplaySettings,
    getHasFileOutput,
    getLocalFileOutput,
    getRemoteOrLocal,
} from '../../redux/slices/settings/settingsSlice';
import {
    ConnectionStatusIconsContainer,
    ConnectionTypeInfo,
    FragmentWrapper,
    InfoDivider,
    OpenFileContainer,
    OpenFileText,
    OpenIconWrapper,
    TitleLabelContainer,
    TopBarContainer,
    TopBarIconWrapper,
    VerticalDivider,
} from './top-bar.styles';
import Tooltip from '@mui/material/Tooltip';

/**
 * Component for GUI's top bar display.
 *
 * @component
 *
 */
const TopBarComponent = (props) => {
    const reduxInfo = useSelector(getTopBarInfo);
    const remoteOrLocal = useSelector(getRemoteOrLocal);
    const hasFileOutput = useSelector(getHasFileOutput);
    const localFileOutput = useSelector(getLocalFileOutput);
    const firstDisplaySettings = useSelector(getFirstDisplaySettings);

    const {
        processingFile,
        connectedServer,
        numberOfFiles,
        isDownload,
        isUpload,
        isConnected,
    } = reduxInfo;

    // TODO: Future refactoring, clean up the ternary logic
    return processingFile || isConnected ? (
        <TopBarContainer>
            <TitleLabelContainer>
                {remoteOrLocal === true ||
                (remoteOrLocal === false && hasFileOutput === true) ? (
                    <FragmentWrapper>
                        <InfoDivider>&#8427;</InfoDivider>
                        &nbsp;&nbsp;
                        <ConnectionTypeInfo>Connected to </ConnectionTypeInfo>
                        &nbsp;&nbsp;
                        {connectedServer !== null
                            ? connectedServer
                            : localFileOutput}{' '}
                        &nbsp;
                        <InfoDivider>/</InfoDivider>&nbsp;
                        <ConnectionTypeInfo>Processing</ConnectionTypeInfo>
                        &nbsp;&nbsp;
                    </FragmentWrapper>
                ) : (
                    <OpenFileContainer onClick={() => props.getFileFromLocal()}>
                        <Tooltip title={'Open File'}>
                            <OpenIconWrapper>
                                <OpenIcon
                                    color={'#ffffff'}
                                    width={'24px'}
                                    height={'24px'}
                                />
                            </OpenIconWrapper>
                        </Tooltip>
                        <OpenFileText>OPEN FILE</OpenFileText>
                        <VerticalDivider />
                    </OpenFileContainer>
                )}
                <span>{processingFile} &nbsp;</span>
            </TitleLabelContainer>
            <ConnectionStatusIconsContainer>
                {remoteOrLocal === true ||
                (remoteOrLocal === false && hasFileOutput === true) ? (
                    <FragmentWrapper>
                        <Tooltip title={'Number of Files'}>
                            <TopBarIconWrapper>
                                <FileQueueIcon
                                    color={'#ffffff'}
                                    width={'32px'}
                                    height={'32px'}
                                    numberOfFiles={numberOfFiles}
                                />
                            </TopBarIconWrapper>
                        </Tooltip>
                        {remoteOrLocal === true ? (
                            <FragmentWrapper>
                                <TrafficIcon
                                    isDownload={isDownload}
                                    isUpload={isUpload}
                                    color={'#ffffff'}
                                    width={'32px'}
                                    height={'32px'}
                                />
                                <Tooltip
                                    title={
                                        isConnected
                                            ? 'Connected'
                                            : 'Not Connected'
                                    }>
                                    <TopBarIconWrapper>
                                        <ConnectionStatusIcon
                                            color={'#ffffff'}
                                            width={'32px'}
                                            height={'32px'}
                                            isConnected={isConnected}
                                        />
                                    </TopBarIconWrapper>
                                </Tooltip>
                            </FragmentWrapper>
                        ) : null}
                    </FragmentWrapper>
                ) : null}
                <VerticalDivider />
                <CogWheelIcon
                    connectToCommandServer={props.connectToCommandServer}
                    color={'#ffffff'}
                    width={'24px'}
                    height={'24px'}
                />
                <MenuToggleIcon
                    color={'#ffffff'}
                    width={'32px'}
                    height={'32px'}
                    cornerstone={props.cornerstone}
                />
            </ConnectionStatusIconsContainer>
        </TopBarContainer>
    ) : (
        <TopBarContainer>
            <TitleLabelContainer>
                {!remoteOrLocal &&
                localFileOutput === '' &&
                !firstDisplaySettings ? (
                    <OpenFileContainer onClick={() => props.getFileFromLocal()}>
                        <Tooltip title={'Open File'}>
                            <OpenIconWrapper>
                                <OpenIcon
                                    color={'#ffffff'}
                                    width={'24px'}
                                    height={'24px'}
                                />
                            </OpenIconWrapper>
                        </Tooltip>
                        <OpenFileText>OPEN FILE</OpenFileText>
                        <VerticalDivider />
                    </OpenFileContainer>
                ) : null}
            </TitleLabelContainer>
            <ConnectionStatusIconsContainer>
                <CogWheelIcon
                    connectToCommandServer={props.connectToCommandServer}
                    color={'#ffffff'}
                    width={'24px'}
                    height={'24px'}
                />
            </ConnectionStatusIconsContainer>
        </TopBarContainer>
    );
};

TopBarComponent.propTypes = {
    /**
     * Function passed into the SettingsIcon component to check connection to command server
     */
    connectToCommandServer: PropTypes.func,
    /**
     * Main cornerstone object, used to resize viewports if needed.
     */
    cornerstone: PropTypes.object,
    /**
     * Getter function for getting local file if remote connection is off.
     */
    getFileFromLocal: PropTypes.func,
};

export default TopBarComponent;
