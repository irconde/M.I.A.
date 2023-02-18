import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Channels } from '../../utils/enums/Constants';
import {
    LazyImageMenuContainer,
    LazyImagesContainer,
} from './lazy-image-menu.styles';
import LazyImageContainerComponent from './lazy-image-container.component';
import {
    getCurrFileName,
    getLazyImageMenuVisible,
} from '../../redux/slices/ui.slice';

const ipcRenderer = window.require('electron').ipcRenderer;
const MAX_THUMBNAILS_COUNT = 40;
const THUMBNAILS_FETCH_AMOUNT = 5;
const TOP_SCROLL_PER_THUMBNAIL = 2.8;

/**
 * Component for displaying the lazy image menu.
 *
 * @component
 *
 */
function LazyImageMenuComponent() {
    const [thumbnails, setThumbnails] = useState([]);
    const isLazyMenuVisible = useSelector(getLazyImageMenuVisible);
    const currentFileName = useSelector(getCurrFileName);
    const [currChunk, setCurrChunk] = useState(0);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        addElectronChannels();
    }, []);

    const addElectronChannels = () => {
        const {
            removeThumbnail,
            addThumbnail,
            updateThumbnails,
            requestInitialThumbnailsList,
        } = Channels;
        ipcRenderer
            .on(removeThumbnail, (e, removedThumbnailName) => {
                // must use a function here to get the most up-to-date state
                setThumbnails((thumbnails) =>
                    thumbnails.filter(
                        (thumbnail) => thumbnail !== removedThumbnailName
                    )
                );
            })
            .on(addThumbnail, (e, addedThumbnail) => {
                // must use a function here to get the most up-to-date state
                setThumbnails((thumbnails) => [
                    ...thumbnails,
                    ...addedThumbnail,
                ]);
            })
            .on(updateThumbnails, (e, thumbnails) => {
                setThumbnails(thumbnails);
                setCurrChunk(0);
            });
        ipcRenderer
            .invoke(requestInitialThumbnailsList)
            .then(setThumbnails)
            .catch(() => {
                console.log('no thumbnails to begin with');
            });
    };

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } =
            scrollContainerRef.current;

        if (scrollTop === 0 && currChunk !== 0) {
            setCurrChunk(currChunk - 1);
            scrollContainerRef.current.scrollTop =
                TOP_SCROLL_PER_THUMBNAIL * THUMBNAILS_FETCH_AMOUNT;
        } else if (
            Math.ceil(scrollHeight - scrollTop) === clientHeight &&
            thumbnails.length >= calculateInterval().end
        ) {
            setCurrChunk(currChunk + 1);
        }
    };

    const calculateInterval = () => {
        const start = currChunk * THUMBNAILS_FETCH_AMOUNT;
        return {
            start,
            end: start + MAX_THUMBNAILS_COUNT,
        };
    };

    const { start, end } = calculateInterval();
    return (
        <LazyImageMenuContainer
            ref={scrollContainerRef}
            onScroll={handleScroll}>
            <LazyImagesContainer collapsedLazyMenu={isLazyMenuVisible}>
                {thumbnails
                    .slice(start, end)
                    .map(({ fileName, filePath, hasAnnotations = false }) => (
                        <LazyImageContainerComponent
                            key={fileName}
                            selected={fileName === currentFileName}
                            fileName={fileName}
                            filePath={filePath}
                            hasAnnotations={hasAnnotations}
                        />
                    ))}
            </LazyImagesContainer>
        </LazyImageMenuContainer>
    );
}

LazyImageMenuComponent.propTypes = {};

export default LazyImageMenuComponent;
