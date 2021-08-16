import React from 'react';
import PropTypes from 'prop-types';

import ConnectionErrorIcon from '../../icons/ConnectionErrorIcon.js';
import ConnectionVerifiedIcon from '../../icons/ConnectionVerifiedIcon.js';

const ConnectionResult = (props) => {
    const containerStyle = {
        display: 'flex',
        flexDirection: 'row',
        flexShrink: '0',
    };
    const svgContainerStyle = {
        display: 'flex',
        alignItems: 'center',
        marginLeft: '0.4rem',
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
                    <p style={{ color: redColor }}>Connection Successful</p>
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
                    <p style={{ color: greenColor }}>Server unreachable</p>
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
