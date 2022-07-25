import React from 'react';
import PropTypes from 'prop-types';
import { CogIconWrapper, StyledCogWheelIcon } from './settings-cog.icon.styles';
import { toggleSettingsVisibility } from '../../../redux/slices/ui/uiSlice';
import { useDispatch } from 'react-redux';
import Tooltip from '@mui/material/Tooltip';

const CogWheelIcon = (props) => {
    const dispatch = useDispatch();
    const handleOpen = () => {
        dispatch(toggleSettingsVisibility(true));
    };

    return (
        <Tooltip title={'Open Settings'}>
            <CogIconWrapper onClick={() => handleOpen()}>
                <StyledCogWheelIcon
                    width={props.width}
                    height={props.height}
                    color={props.color}
                />
            </CogIconWrapper>
        </Tooltip>
    );
};

CogWheelIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    /**
     * Function passed in from App.js for connecting to command server (used in testing connection in SettingsModal.)
     */
    connectToCommandServer: PropTypes.func,
};

export default CogWheelIcon;
