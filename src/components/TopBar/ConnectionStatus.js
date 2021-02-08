import React from 'react';
import { ReactComponent as ConnectionIcon } from '../../icons/ic_connection.svg';
import { ReactComponent as NoConnectionIcon } from '../../icons/ic_no_connection.svg';
import PropTypes from 'prop-types';

const ConnectionStatus = ({ isConnected, style }) => {
    return isConnected ? (
        <ConnectionIcon title="Connected" style={style} />
    ) : (
        <NoConnectionIcon title="Disconnected" style={style} />
    );
};

ConnectionStatus.propTypes = {
    isConnected: PropTypes.bool.isRequired,
    style: PropTypes.string,
};

export default ConnectionStatus;
