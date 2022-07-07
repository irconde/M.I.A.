import React from 'react';
import { useSelector } from 'react-redux';
import { getNumFilesInQueue } from '../../redux/slices/server/serverSlice';
import {
    getHasFileOutput,
    getRemoteOrLocal,
} from '../../redux/slices/settings/settingsSlice';
import { getLocalFileOpen } from '../../redux/slices/ui/uiSlice';
import { NoFileSignLabel, NoFileSignWrapper } from './no-file-sign.styles';
import { ReactComponent as NoFilesIcon } from '../../icons/ic_no_files.svg';

/**
 * GUI widget that provides displays an image in the middle of the screen to
 * provide user with feedback when there are not pending files on the file queue
 *
 * @component
 */
const NoFileSignComponent = () => {
    const numberOfFiles = useSelector(getNumFilesInQueue);
    const localFileOpen = useSelector(getLocalFileOpen);
    let isVisible = numberOfFiles <= 0 ? false : true;
    const remoteOrLocal = useSelector(getRemoteOrLocal);
    const hasFileOutput = useSelector(getHasFileOutput);

    const imgStyle = {
        opacity: '0.9',
        width: '90%',
        height: '90%',
    };

    if ((isVisible && remoteOrLocal) || (localFileOpen && !remoteOrLocal)) {
        return <></>;
    } else {
        return (
            <NoFileSignWrapper>
                <NoFilesIcon title="NoFilesAvailable" style={imgStyle} />
                <NoFileSignLabel>
                    {' '}
                    ·{' '}
                    {remoteOrLocal === true ||
                    (remoteOrLocal === false && hasFileOutput === true)
                        ? 'No file available'
                        : 'Select a file'}{' '}
                    ·
                </NoFileSignLabel>
            </NoFileSignWrapper>
        );
    }
};

export default NoFileSignComponent;
