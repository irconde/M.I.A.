import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import FileQueueIcon from '../../icons/FileQueueIcon';
import SettingsIcon from '../../icons/SettingsIcon';
import { getTopBarInfo } from '../../redux/slices/server/serverSlice';
import ConnectionStatus from './ConnectionStatus';
import FileUploadStatus from './FileUploadStatus';
import MenuToggleIcon from '../../icons/MenuToggleIcon';
import {
    getFirstDisplaySettings,
    getHasFileOutput,
    getLocalFileOutput,
    getRemoteOrLocal,
} from '../../redux/slices/settings/settingsSlice';
import OpenIcon from '../../icons/OpenIcon';
import {
    ConnectionStatusIconsContainer,
    ConnectionTypeInfo,
    FragmentWrapper,
    InfoDivider,
    OpenFileContainer,
    OpenFileText,
    TitleLabelContainer,
    TopBarContainer,
    VerticalDivider,
} from './top-bar.styles';

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
                        <OpenIcon
                            title="Open File"
                            style={{
                                marginRight: '0.75rem',
                                marginLeft: '1.5rem',
                                display: 'inherit',
                            }}
                        />
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
                        <FileQueueIcon
                            title="Number of Files"
                            numberOfFiles={numberOfFiles}
                            style={{ margin: '0.75rem' }}
                        />
                        {remoteOrLocal === true ? (
                            <FragmentWrapper>
                                <FileUploadStatus
                                    isDownload={isDownload}
                                    isUpload={isUpload}
                                    styles={{ margin: '0.75rem' }}
                                />
                                <ConnectionStatus
                                    isConnected={isConnected}
                                    style={{ margin: '0.75rem' }}
                                />
                            </FragmentWrapper>
                        ) : null}
                    </FragmentWrapper>
                ) : null}
                <VerticalDivider />
                <SettingsIcon
                    style={{ margin: '0.75rem' }}
                    connectToCommandServer={props.connectToCommandServer}
                    title="Settings"
                />
                <MenuToggleIcon
                    style={{ margin: '0.5rem 1.5rem 0.5rem -0.5rem' }}
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
                        <OpenIcon
                            title="Open File"
                            style={{
                                marginRight: '0.75rem',
                                marginLeft: '1.5rem',
                                display: 'inherit',
                            }}
                        />
                        <OpenFileText>OPEN FILE</OpenFileText>
                        <VerticalDivider />
                    </OpenFileContainer>
                ) : null}
            </TitleLabelContainer>
            <ConnectionStatusIconsContainer>
                <SettingsIcon
                    style={{ margin: '0.75rem' }}
                    connectToCommandServer={props.connectToCommandServer}
                    title="Settings"
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
