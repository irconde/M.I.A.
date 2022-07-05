import React from 'react';
import PropTypes from 'prop-types';

import ConnectionErrorIcon from '../../icons/ConnectionErrorIcon.js';
import ConnectionVerifiedIcon from '../../icons/ConnectionVerifiedIcon.js';
import {
    ConnectionResult,
    ConnectionStatusText,
} from './connection-result.styles.js';

/**
 * Connection result icon in SettingsModal displaying ConnectionVerifiedIcon.js component on success and ConnectionErrorIcon.js on failure.
 *
 * @component
 *
 */
const ConnectionResultComponent = (props) => {
    const svgContainerStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        marginLeft: '0.8rem',
        marginRight: '0.25rem',
    };
    const svgStyle = {
        height: '24px',
        width: '24px',
    };
    const redColor = '#d94545';
    const greenColor = '#519e00';
    if (props.display === true) {
        if (props.connected === true) {
            return (
                <ConnectionResult>
                    <ConnectionVerifiedIcon
                        style={svgContainerStyle}
                        svgStyle={{
                            ...svgStyle,
                            color: greenColor,
                        }}
                    />
                    <ConnectionStatusText connected={props.connected}>
                        Connection Successful
                    </ConnectionStatusText>
                </ConnectionResult>
            );
        } else {
            return (
                <ConnectionResult>
                    <ConnectionErrorIcon
                        style={svgContainerStyle}
                        svgStyle={{
                            ...svgStyle,
                            color: redColor,
                        }}
                    />
                    <ConnectionStatusText connected={props.connected}>
                        Server unreachable
                    </ConnectionStatusText>
                </ConnectionResult>
            );
        }
    } else return null;
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
