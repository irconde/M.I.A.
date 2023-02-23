import { useEffect, useState } from 'react';
import { Channels } from '../enums/Constants';

const ipcRenderer = window.require('electron').ipcRenderer;

function useThumbnailsLoading(defaultVal = true) {
    const [isLoading, setIsLoading] = useState(defaultVal);

    useEffect(() => {
        ipcRenderer.invoke(Channels.thumbnailStatus).then((isLoading) => {
            setIsLoading(isLoading);
            ipcRenderer.on(Channels.thumbnailStatus, (e, isLoading) => {
                console.log({ isLoading });
                setIsLoading(isLoading);
            });
        });
    }, []);

    return isLoading;
}

export default useThumbnailsLoading;
