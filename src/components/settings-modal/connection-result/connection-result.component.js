import React from 'react';
import PropTypes from 'prop-types';

import CheckmarkIcon from '../../../icons/settings-modal/checkmark-icon/checkmark.icon';
import ExclamationPointIcon from '../../../icons/settings-modal/exclamation-point-icon/exclamation-point.icon';
import {
    ConnectionResult,
    ConnectionStatusText,
    errorColor,
    successColor,
} from './connection-result.styles.js';

const iconDimensions = {
    height: '24px',
    width: '24px',
};

/**
 * Connection result icon in SettingsModal displaying ConnectionVerifiedIcon.js component on success and ConnectionErrorIcon.js on failure.
 *
 * @component
 *
 */
const ConnectionResultComponent = ({ display, connected }) => {
    return display ? (
        <ConnectionResult>
            {connected ? (
                <CheckmarkIcon {...iconDimensions} color={successColor} />
            ) : (
                <ExclamationPointIcon {...iconDimensions} color={errorColor} />
            )}
            <ConnectionStatusText connected={connected}>
                {connected ? 'Connection Successful' : 'Server unreachable'}
            </ConnectionStatusText>
        </ConnectionResult>
    ) : null;
};

ConnectionResultComponent.propTypes = {
    /**
     * True if icon should be visible.
     */
    display: PropTypes.bool,
    /**
     * True if connection to server was successful.
     */
    connected: PropTypes.bool,
};

export default ConnectionResultComponent;
