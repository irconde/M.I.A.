import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { toggleSettingsVisibility } from '../redux/slices/ui/uiSlice';
import SettingsCog from './SettingsCog';
import {
    getFirstDisplaySettings,
    getLoadingElectronCookie,
} from '../redux/slices/settings/settingsSlice';

const IconStyle = styled.div`
    margin: 1rem 2.5rem 0.5rem 0rem;
    width: 32px;
    height: 32px;
    display: flex;
    justify-contents: center;
`;

/**
 * Settings icon in TopBar component used to toggle SettingsModal component visibility.
 *
 * @component
 *
 */
const SettingsIcon = (props) => {
    const dispatch = useDispatch();
    const firstDisplaySettings = useSelector(getFirstDisplaySettings);
    const loadingElectronCookie = useSelector(getLoadingElectronCookie);
    useEffect(() => {
        if (firstDisplaySettings === true && !loadingElectronCookie) {
            console.log('first display settings');
            handleOpen();
        }
    }, [firstDisplaySettings]);
    const handleOpen = () => {
        dispatch(toggleSettingsVisibility(true));
    };
    const style = {
        ...props.style,
        cursor: 'pointer',
    };
    return (
        <>
            <IconStyle style={style} onClick={() => handleOpen()}>
                <SettingsCog
                    style={{ marginTop: 'auto', marginBottom: 'auto' }}
                    title={props.title}
                />
            </IconStyle>
        </>
    );
};

SettingsIcon.propTypes = {
    /**
     * String value that is shown when hovering component
     */
    title: PropTypes.string,
    /**
     * Function passed in from App.js for connecting to command server (used in testing connection in SettingsModal.)
     */
    connectToCommandServer: PropTypes.func,
    /**
     * CSS object used for stylizing SVG element
     */
    style: PropTypes.object,
};

export default SettingsIcon;
