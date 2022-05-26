import React from 'react';
import { ReactComponent as ConnectionIcon } from '../../icons/ic_connection.svg';
import { ReactComponent as NoConnectionIcon } from '../../icons/ic_no_connection.svg';
import PropTypes from 'prop-types';

/**
 * Component for displaying connection status.
 *
 * @component
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
    /**
     * Boolean value determining if connection is successful
     */
    isConnected: PropTypes.bool.isRequired,
    /**
     * CSS stylization for icons
     */
    style: PropTypes.object,
};

export default ConnectionStatus;
