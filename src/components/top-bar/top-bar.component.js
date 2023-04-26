import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
    ConnectionTypeInfo,
    ContactIconsContainer,
    FragmentWrapper,
    IconsContainer,
    ImportDataContainer,
    ImportDataText,
    ImportIconWrapper,
    InfoWrapper,
    TopBarContainer,
    TopBarIconWrapper,
    VerticalDivider,
} from './top-bar.styles';
import { getAssetsDirPaths } from '../../redux/slices/settings.slice';
import Tooltip from '@mui/material/Tooltip';
import MenuFoldedIcon from '../../icons/top-bar/menu-folded-icon/menu-folded.icon';
import MenuUnfoldedIcon from '../../icons/top-bar/menu-unfolded-icon/menu-unfolded.icon';
import InfoIcon from '../../icons/shared/info-icon/info.icon';
import ImportIcon from '../../icons/top-bar/import-icon/import.icon';
import { Channels, cornerstoneMode } from '../../utils/enums/Constants';
import ChatIcon from '../../icons/top-bar/chat-icon/chat.icon';
import {
    clearAnnotationWidgets,
    toggleSideMenu,
    updateCornerstoneMode,
    updateCurrFileName,
    updateFABVisibility,
} from '../../redux/slices/ui.slice';
import Utils from '../../utils/general/Utils';
import ImagesIcon from '../../icons/shared/images-icon/images.icon';
import AnnotationIcon from '../../icons/annotation-icon/annotation.icon';
import { getAnnotationCount } from '../../redux/slices/annotation.slice';

const ipcRenderer = window.require('electron').ipcRenderer;
const iconProps = {
    width: '24px',
    height: '24px',
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
    const annotationCount = useSelector(getAnnotationCount);
    const { selectedImagesDirPath, selectedAnnotationFile } =
        useSelector(getAssetsDirPaths);
    const annotationFilePath = Utils.truncateFilePath(
        selectedAnnotationFile,
        25
    );
    const imagesPath = Utils.truncateFilePath(selectedImagesDirPath, 25);
    const [isOpen, setIsOpen] = useState(true);
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

    const toggleClickHandler = () => {
        setIsOpen(!isOpen);
        dispatch(toggleSideMenu());
    };

    return (
        <TopBarContainer id={'TopBar Container'}>
            <ImportDataContainer
                id={'Import Data Container'}
                onClick={props.openImportModal}>
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

            <FragmentWrapper id={'Fragment Wrapper'}>
                <InfoWrapper>
                    <ImagesIcon
                        width={'24px'}
                        height={'24px'}
                        color={'#c6c6c6'}
                    />
                    <ConnectionTypeInfo>
                        IMAGES: &nbsp; &nbsp;
                        {imagesPath}
                    </ConnectionTypeInfo>
                </InfoWrapper>
                <InfoWrapper>
                    <AnnotationIcon
                        width={'24px'}
                        height={'24px'}
                        color={'#c6c6c6'}
                    />
                    <ConnectionTypeInfo>
                        ANNOTATIONS: &nbsp; &nbsp;
                        {annotationFilePath}
                    </ConnectionTypeInfo>
                </InfoWrapper>
            </FragmentWrapper>

            <IconsContainer>
                <VerticalDivider />
                <ContactIconsContainer>
                    <TopBarIconWrapper onClick={props.openAboutModal}>
                        <InfoIcon {...iconProps} />
                    </TopBarIconWrapper>
                    <Tooltip title={'Contact Us'}>
                        <TopBarIconWrapper onClick={props.openContactModal}>
                            <ChatIcon {...iconProps} />
                        </TopBarIconWrapper>
                    </Tooltip>
                </ContactIconsContainer>
                <VerticalDivider />
                <Tooltip title={'Fold/unfold Side Menu'}>
                    <TopBarIconWrapper
                        onClick={() => {
                            if (annotationCount > 0) {
                                toggleClickHandler();
                            }
                        }}>
                        {isOpen ? (
                            <MenuUnfoldedIcon
                                width={'32px'}
                                height={'32px'}
                                color={annotationCount > 0 ? 'white' : 'gray'}
                            />
                        ) : (
                            <MenuFoldedIcon
                                width={'32px'}
                                height={'32px'}
                                color={annotationCount > 0 ? 'white' : 'gray'}
                            />
                        )}
                    </TopBarIconWrapper>
                </Tooltip>
            </IconsContainer>
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
