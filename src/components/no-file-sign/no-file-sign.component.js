import React from 'react';
import { useSelector } from 'react-redux';
import { getNumFilesInQueue } from '../../redux/slices/server/serverSlice';
import {
    getFirstDisplaySettings,
    getHasFileOutput,
    getRemoteOrLocal,
} from '../../redux/slices/settings/settingsSlice';
import { getLocalFileOpen } from '../../redux/slices/ui/uiSlice';
import { NoFileSignLabel, NoFileSignWrapper } from './no-file-sign.styles';
import NoFileIcon from '../../icons/no-file-sign/no-file-icon/no-file.icon';

/**
 * GUI widget that provides displays an image in the middle of the screen to
 * provide user with feedback when there are not pending files on the file queue
 *
 * @component
 */
const NoFileSignComponent = () => {
    const numberOfFiles = useSelector(getNumFilesInQueue);
    const localFileOpen = useSelector(getLocalFileOpen);
    const remoteOrLocal = useSelector(getRemoteOrLocal);
    const hasFileOutput = useSelector(getHasFileOutput);
    const firstDisplaySettings = useSelector(getFirstDisplaySettings);

    if (
        (numberOfFiles > 0 && remoteOrLocal) ||
        firstDisplaySettings ||
        (localFileOpen && !remoteOrLocal)
    ) {
        return <></>;
    } else {
        return (
            <NoFileSignWrapper>
                <NoFileIcon width={'90%'} height={'90%'} color={'white'} />
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
