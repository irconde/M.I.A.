import React from 'react';
import PropTypes from 'prop-types';

import ConnectionErrorIcon from '../../icons/ConnectionErrorIcon.js';
import ConnectionVerifiedIcon from '../../icons/ConnectionVerifiedIcon.js';

/**
 * Connection result icon in SettingsModal displaying ConnectionVerifiedIcon.js component on success and ConnectionErrorIcon.js on failure.
 *
 * @component
 *
 * @param {PropTypes} props - Expected props: display<boolean>, connected<boolean>
 * @param {boolean} display - Destructured from props -- True if icon should be visible.
 * @param {boolean} connected - Destructured from props -- True if connection to server was successful.
 *
 */
const ConnectionResult = (props) => {
    const containerStyle = {
        display: 'inline-flex',
        flexDirection: 'row',
        flexShrink: '0',
        alignItems: 'center',
    };
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
    const redColor = '#519e00';
    const greenColor = '#d94545';
    if (props.display === true) {
        if (props.connected === true) {
            return (
                <div style={containerStyle}>
                    <ConnectionVerifiedIcon
                        style={svgContainerStyle}
                        svgStyle={{
                            ...svgStyle,
                            color: redColor,
                        }}
                    />
                    <span style={{ color: redColor }}>
                        Connection Successful
                    </span>
                </div>
            );
        } else {
            return (
                <div style={containerStyle}>
                    <ConnectionErrorIcon
                        style={svgContainerStyle}
                        svgStyle={{
                            ...svgStyle,
                            color: greenColor,
                        }}
                    />
                    <span style={{ color: greenColor }}>
                        Server unreachable
                    </span>
                </div>
            );
        }
    } else return null;
};

ConnectionResult.propTypes = {
    display: PropTypes.bool,
    connected: PropTypes.bool,
};

export default ConnectionResult;
