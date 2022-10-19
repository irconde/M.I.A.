import React from 'react';
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
import { getAssetsDirPaths } from '../../redux/slices/settings/settings.slice';
import Tooltip from '@mui/material/Tooltip';
import MenuToggleIcon from '../../icons/top-bar/menu-toggle-icon/menu-toggle.icon';
import InfoIcon from '../../icons/shared/info-icon/info.icon';
import ImportIcon from '../../icons/top-bar/import-icon/import.icon';

/**
 * Component for GUI's top bar display.
 *
 * @component
 *
 */
const TopBarComponent = (props) => {
    const { selectedImagesDirPath, selectedAnnotationsDirPath } =
        useSelector(getAssetsDirPaths);
    //const currentFileName = ipcRenderer.invoke(Channels.getFileName, null);

    return (
        <TopBarContainer>
            <TitleLabelContainer>
                <ImportDataContainer>
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
                    <InfoDivider>/</InfoDivider>&nbsp;
                    <ConnectionTypeInfo>Processing</ConnectionTypeInfo>
                    &nbsp;&nbsp;
                </FragmentWrapper>
                {/*// TODO: add file name*/}
                <span>{''} &nbsp;</span>
            </TitleLabelContainer>

            <ConnectionStatusIconsContainer>
                <VerticalDivider />
                <Tooltip title={'About'}>
                    <TopBarIconWrapper>
                        <InfoIcon
                            color={'#ffffff'}
                            width={'32px'}
                            height={'32px'}
                        />
                    </TopBarIconWrapper>
                </Tooltip>
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
};

export default TopBarComponent;
