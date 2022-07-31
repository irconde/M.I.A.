import React from 'react';
import PropTypes from 'prop-types';
import { StyledCogWheelIcon } from '../../shared/settings-cog-icon/settings-cog.icon.styles';
import { toggleSettingsVisibility } from '../../../redux/slices/ui/uiSlice';
import { useDispatch } from 'react-redux';
import Tooltip from '@mui/material/Tooltip';
import { TopBarCogIconWrapper } from '../../../components/top-bar/top-bar.styles';

const CogWheelIcon = (props) => {
    const dispatch = useDispatch();
    const handleOpen = () => {
        dispatch(toggleSettingsVisibility(true));
    };

    return (
        <Tooltip title={'Open Settings'}>
            <TopBarCogIconWrapper onClick={() => handleOpen()}>
                <StyledCogWheelIcon
                    width={props.width}
                    height={props.height}
                    color={props.color}
                />
            </TopBarCogIconWrapper>
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
