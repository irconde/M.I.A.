import React from 'react';
import { ReactComponent as ConnectionIcon } from '../../icons/ic_connection.svg';
import { ReactComponent as NoConnectionIcon } from '../../icons/ic_no_connection.svg';
import PropTypes from 'prop-types';

/**
 * Component for displaying connection status.
 *
 * @component
 *
 * @param {boolean} isConnected - Boolean value determining if connection is successful
 * @param {Object} style - CSS stylization for icons
 *
 */
const ConnectionStatus = ({ isConnected, style }) => {
    return isConnected ? (
        <ConnectionIcon title="Connected" style={style} />
    ) : (
        <NoConnectionIcon title="Disconnected" style={style} />
    );
};

ConnectionStatus.propTypes = {
    isConnected: PropTypes.bool.isRequired,
    style: PropTypes.object,
};

export default ConnectionStatus;
