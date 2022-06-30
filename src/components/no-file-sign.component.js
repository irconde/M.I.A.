import React from 'react';
import { useSelector } from 'react-redux';
import { ReactComponent as NoFilesIcon } from '../icons/ic_no_files.svg';
import {
    getCurrentFile,
    getNumFilesInQueue,
} from '../redux/slices/server/serverSlice';
import {
    getHasFileOutput,
    getLocalFileOutput,
    getRemoteOrLocal,
} from '../redux/slices/settings/settingsSlice';

/**
 * GUI widget that provides displays an image in the middle of the screen to
 * provide user with feedback when there are not pending files on the file queue
 *
 * @component
 */
const NoFileSign = () => {
    let isVisible;
    const numberOfFiles = useSelector(getNumFilesInQueue);
    const remoteOrLocal = useSelector(getRemoteOrLocal);
    const hasFileOutput = useSelector(getHasFileOutput);
    const currentFile = useSelector(getCurrentFile);
    const localFileOutput = useSelector(getLocalFileOutput);
    if (remoteOrLocal) {
        // Connected to a remote host and determining if files are in queue
        if (numberOfFiles > 0) {
            isVisible = false;
        } else {
            isVisible = true;
        }
    } else {
        // Offline mode
        if (localFileOutput !== '' && localFileOutput !== null) {
            // Local workspace determination
            isVisible = false;
        } else {
            // Single selection determination
            if (currentFile === '' || currentFile === null) {
                isVisible = true;
            } else {
                isVisible = false;
            }
        }
    }
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
        return (
            <div style={divStyle}>
                <NoFilesIcon title="NoFilesAvailable" style={imgStyle} />
                <p style={paragraphStyle}>
                    {' '}
                    ·{' '}
                    {remoteOrLocal === true ||
                    (remoteOrLocal === false && hasFileOutput === true)
                        ? 'No file available'
                        : 'Select a file'}{' '}
                    ·
                </p>
            </div>
        );
    } else return null;
};

export default NoFileSign;
