import React from 'react';
import PropTypes from 'prop-types';
import { ReactComponent as ConnectionSuccessful } from '../../icons/ic_verified.svg';
import { ReactComponent as ConnectionFailure } from '../../icons/ic_error.svg';

const ConnectionResult = (props) => {
    if (props.display === true) {
        if (props.connected === true) {
            return (
                <div>
                    <ConnectionSuccessful />
                    <p style={{ color: '#519e00' }}>Connection Successful</p>
                </div>
            );
        } else {
            return (
                <div>
                    <ConnectionFailure />
                    <p style={{ color: '#d94545' }}>Server unreachable</p>
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
