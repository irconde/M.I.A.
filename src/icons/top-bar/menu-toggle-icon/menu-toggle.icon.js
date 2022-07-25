import React from 'react';
import PropTypes from 'prop-types';
import {
    MenuIconWrapper,
    StyledMenuToggleIcon,
} from './menu-toggle.icon.styles';
import Tooltip from '@mui/material/Tooltip';
import { useDispatch, useSelector } from 'react-redux';
import {
    getReceivedTime,
    toggleCollapsedSideMenu,
} from '../../../redux/slices/ui/uiSlice';
import {
    getDisplaySummarizedDetections,
    getHasFileOutput,
    getLocalFileOutput,
    getRemoteOrLocal,
} from '../../../redux/slices/settings/settingsSlice';
import isElectron from 'is-electron';

const MenuToggleIcon = (props) => {
    const dispatch = useDispatch();
    const visible = useSelector(getReceivedTime);
    const hasFileOutput = useSelector(getHasFileOutput);
    const displaySummarizedDetections = useSelector(
        getDisplaySummarizedDetections
    );
    const remoteOrLocal = useSelector(getRemoteOrLocal);
    const localFileOutput = useSelector(getLocalFileOutput);
    const desktopMode =
        isElectron() && !remoteOrLocal && localFileOutput !== '';
    const toggleClickHandler = () => {
        dispatch(
            toggleCollapsedSideMenu({
                cornerstone: props.cornerstone,
                desktopMode,
            })
        );
    };
    if ((visible !== null || hasFileOutput) && !displaySummarizedDetections) {
        return (
            <MenuIconWrapper onClick={toggleClickHandler}>
                <Tooltip title={'Fold/unfold menu'}>
                    <StyledMenuToggleIcon
                        width={props.width}
                        height={props.height}
                        color={props.color}
                    />
                </Tooltip>
            </MenuIconWrapper>
        );
    } else return null;
};

MenuToggleIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    cornerstone: PropTypes.object,
};

export default MenuToggleIcon;
