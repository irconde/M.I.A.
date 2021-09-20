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
`;

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
                <SettingsCog title={props.title} />
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
