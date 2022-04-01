import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import SettingsModal from '../components/SettingsModal/SettingsModal';
import { toggleSettingsVisibility } from '../redux/slices/ui/uiSlice';
import SettingsCog from './SettingsCog';
import { getFirstDisplaySettings } from '../redux/slices/settings/settingsSlice';

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
 * @param {PropTypes} props - Expected props: title<string>, style<object>
 * @param {String} title - Destructured from props -- String value that is shown when hovering component
 * @param {function} connectToCommandServer - Destructured from props -- Function passed in from App.js for connecting to command server (used in testing connection in SettingsModal.)
 * @param {Object} style - Destructured from props -- CSS object used for stylizing SVG element
 *
 */
const SettingsIcon = (props) => {
    const dispatch = useDispatch();
    const firstDisplaySettings = useSelector(getFirstDisplaySettings);
    useEffect(() => {
        if (firstDisplaySettings === true) handleOpen();
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

            <SettingsModal
                connectToCommandServer={
                    props.connectToCommandServer
                }></SettingsModal>
        </>
    );
};

SettingsIcon.propTypes = {
    title: PropTypes.string,
    connectToCommandServer: PropTypes.func,
    style: PropTypes.object,
};

export default SettingsIcon;
