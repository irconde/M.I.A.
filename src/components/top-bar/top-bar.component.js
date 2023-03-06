import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
    ConnectionStatusIconsContainer,
    ConnectionTypeInfo,
    FragmentWrapper,
    ImportDataContainer,
    ImportDataText,
    ImportIconWrapper,
    InfoDivider,
    MenuIconWrapper,
    TitleLabelContainer,
    TopBarContainer,
    TopBarIconWrapper,
    VerticalDivider,
} from './top-bar.styles';
import { getAssetsDirPaths } from '../../redux/slices/settings.slice';
import Tooltip from '@mui/material/Tooltip';
import MenuToggleIcon from '../../icons/top-bar/menu-toggle-icon/menu-toggle.icon';
import InfoIcon from '../../icons/shared/info-icon/info.icon';
import ImportIcon from '../../icons/top-bar/import-icon/import.icon';
import { Channels, cornerstoneMode } from '../../utils/enums/Constants';
import ChatIcon from '../../icons/top-bar/chat-icon/chat.icon';
import {
    clearAnnotationWidgets,
    updateCornerstoneMode,
    updateCurrFileName,
    updateFABVisibility,
} from '../../redux/slices/ui.slice';
import Utils from '../../utils/general/Utils';

const ipcRenderer = window.require('electron').ipcRenderer;
const iconProps = {
    width: '32px',
    height: '32px',
    color: '#ffffff',
};

/**
 * Component for GUI's top bar display.
 *
 * @component
 *
 */
const TopBarComponent = (props) => {
    const dispatch = useDispatch();
    const { selectedImagesDirPath, selectedAnnotationFile } =
        useSelector(getAssetsDirPaths);
    const [fileState, setFileState] = useState({
        currentFileName: '',
        numberOfFiles: 0,
    });
    useEffect(() => {
        ipcRenderer.on(Channels.newFileUpdate, (e, args) => {
            dispatch(clearAnnotationWidgets());
            dispatch(updateFABVisibility(true));
            dispatch(updateCornerstoneMode(cornerstoneMode.SELECTION));
            const viewport = document.getElementById('imageContainer');
            if (viewport !== null) {
                Utils.resetCornerstoneTools(viewport);
            }
            Utils.dispatchAndUpdateImage(
                dispatch,
                updateCurrFileName,
                args.currentFileName
            );
            setFileState(args);
        });
    }, []);

    return (
        <TopBarContainer>
            <TitleLabelContainer>
                <ImportDataContainer onClick={props.openImportModal}>
                    <ImportDataText>IMPORT DATA</ImportDataText>
                    <Tooltip title={'Import Data'}>
                        <ImportIconWrapper>
                            <ImportIcon
                                color={'#ffffff'}
                                width={'24px'}
                                height={'24px'}
                            />
                        </ImportIconWrapper>
                    </Tooltip>
                </ImportDataContainer>

                <FragmentWrapper id={'wrapper'}>
                    <InfoDivider>&#8427;</InfoDivider>
                    &nbsp;&nbsp;
                    <ConnectionTypeInfo>Connected to </ConnectionTypeInfo>
                    &nbsp;&nbsp;
                    {selectedImagesDirPath} &nbsp;
                    {fileState.currentFileName && (
                        <>
                            <InfoDivider>/</InfoDivider>
                            &nbsp;
                            <ConnectionTypeInfo>Processing</ConnectionTypeInfo>
                        </>
                    )}
                    &nbsp;&nbsp;
                </FragmentWrapper>
                <span>{fileState.currentFileName} &nbsp;</span>
            </TitleLabelContainer>

            <ConnectionStatusIconsContainer>
                <TopBarIconWrapper onClick={props.openAboutModal}>
                    <InfoIcon {...iconProps} />
                </TopBarIconWrapper>
                <Tooltip title={'Contact Us'}>
                    <TopBarIconWrapper onClick={props.openContactModal}>
                        <ChatIcon {...iconProps} />
                    </TopBarIconWrapper>
                </Tooltip>
                <VerticalDivider />
                <Tooltip title={'Fold/unfold menu'}>
                    <MenuIconWrapper>
                        <MenuToggleIcon {...iconProps} />
                    </MenuIconWrapper>
                </Tooltip>
            </ConnectionStatusIconsContainer>
        </TopBarContainer>
    );
};

TopBarComponent.propTypes = {
    /**
     * Getter function for getting local file if remote connection is off.
     */
    getFileFromLocal: PropTypes.func,

    openImportModal: PropTypes.func.isRequired,

    openAboutModal: PropTypes.func.isRequired,

    openContactModal: PropTypes.func.isRequired,
};

export default TopBarComponent;
