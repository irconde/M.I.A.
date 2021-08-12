import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import SettingsModal from '../components/SettingsModal/SettingsModal';
import { toggleSettingsVisibility } from '../redux/slices/ui/uiSlice';
import SettingsCog from './SettingsCog';

const IconStyle = styled.div`
    margin: 1rem 2.5rem 0.5rem 0rem;
`;

const SettingsIcon = (props) => {
    const dispatch = useDispatch();

    const handleOpen = () => {
        dispatch(toggleSettingsVisibility(true));
    };

    return (
        <>
            <IconStyle onClick={() => handleOpen()}>
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
};

export default SettingsIcon;
