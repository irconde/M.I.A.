import React from 'react';
import { useSelector } from 'react-redux';
import { getNumFilesInQueue } from '../../redux/slices/server/serverSlice';
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

    if (numberOfFiles > 0) {
        return <></>;
    } else {
        return (
            <NoFileSignWrapper>
                <NoFileIcon width={'90%'} height={'90%'} color={'white'} />
                <NoFileSignLabel> · Select a file ·</NoFileSignLabel>
            </NoFileSignWrapper>
        );
    }
};

export default NoFileSignComponent;
