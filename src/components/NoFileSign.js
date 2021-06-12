import React, { Component } from 'react';
import { ReactComponent as NoFilesIcon } from '../icons/ic_no_files.svg';

/**
 * GUI widget that provides displays an image in the middle of the screen to
 * provide user with feedback when there are no pending files on the file queue
 */
const NoFileSign = ({ isVisible }) => {
    const paragraphStyle = {
        fontWeight: '500',
        marginTop: '0.0rem',
        textAlign: 'center',
        width: '100%',
        fontSize: '34pt',
        textTransform: 'uppercase',
        color: '#367FFF',
    };
    const divStyle = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        width: 'auto',
        opacity: '1.0',
    };
    const imgStyle = {
        opacity: '0.9',
        width: '90%',
        height: '90%',
    };

    if (isVisible) {
        return <div></div>;
    } else {
        return (
            <div style={divStyle}>
                <NoFilesIcon title="NoFilesAvailable" style={imgStyle} />
                <p style={paragraphStyle}> · No file available ·</p>
            </div>
        );
    }
};

export default NoFileSign;
