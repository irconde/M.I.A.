import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import FileQueueIcon from '../../icons/top-bar/file-queue-icon/file-queue.icon';
import CogWheelIcon from '../../icons/top-bar/settings-cog-icon/settings-cog.icon';
import MenuToggleIcon from '../../icons/top-bar/menu-toggle-icon/menu-toggle.icon';
import OpenIcon from '../../icons/top-bar/open-icon/open.icon';
import { getTopBarInfo } from '../../redux/slices-old/server/serverSlice';
import {
    getHasFileOutput,
    getLocalFileOutput,
} from '../../redux/slices-old/settings/settingsSlice';
import {
    ConnectionStatusIconsContainer,
    ConnectionTypeInfo,
    FragmentWrapper,
    InfoDivider,
    MenuIconWrapper,
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
    const hasFileOutput = useSelector(getHasFileOutput);
    const localFileOutput = useSelector(getLocalFileOutput);

    const { processingFile, connectedServer, numberOfFiles, isConnected } =
        reduxInfo;

    // TODO: Future refactoring, clean up the ternary logic
    return processingFile || isConnected ? (
        <TopBarContainer>
            <TitleLabelContainer>
                {hasFileOutput === true ? (
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
                {hasFileOutput === true ? (
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
                    </FragmentWrapper>
                ) : null}
                <VerticalDivider />

                <CogWheelIcon
                    color={'#ffffff'}
                    width={'24px'}
                    height={'24px'}
                />

                <Tooltip title={'Fold/unfold menu'}>
                    <MenuIconWrapper>
                        <MenuToggleIcon
                            color={'#ffffff'}
                            width={'32px'}
                            height={'32px'}
                            cornerstone={props.cornerstone}
                        />
                    </MenuIconWrapper>
                </Tooltip>
            </ConnectionStatusIconsContainer>
        </TopBarContainer>
    ) : (
        <TopBarContainer>
            <TitleLabelContainer>
                {localFileOutput === '' ? (
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
     * Main cornerstone object, used to resize viewports if needed.
     */
    cornerstone: PropTypes.object,
    /**
     * Getter function for getting local file if remote connection is off.
     */
    getFileFromLocal: PropTypes.func,
};

export default TopBarComponent;
