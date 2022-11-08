import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
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
import { Channels } from '../../utils/enums/Constants';

const ipcRenderer = window.require('electron').ipcRenderer;
/**
 * Component for GUI's top bar display.
 *
 * @component
 *
 */
const TopBarComponent = (props) => {
    const { selectedImagesDirPath, selectedAnnotationFile } =
        useSelector(getAssetsDirPaths);
    const [fileState, setFileState] = useState({
        currentFileName: '',
        numberOfFiles: 0,
    });
    useEffect(() => {
        ipcRenderer.on(Channels.newFileUpdate, (e, args) => {
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
                <VerticalDivider />
                <TopBarIconWrapper onClick={props.openAboutModal}>
                    <InfoIcon
                        color={'#ffffff'}
                        width={'32px'}
                        height={'32px'}
                    />
                </TopBarIconWrapper>
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

    openImportModal: PropTypes.func.isRequired,

    openAboutModal: PropTypes.func.isRequired,
};

export default TopBarComponent;
