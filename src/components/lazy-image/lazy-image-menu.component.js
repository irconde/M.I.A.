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
import { getAnnotations } from '../../redux/slices/annotation.slice';
import { getAssetsDirPaths } from '../../redux/slices/settings.slice';

const ipcRenderer = window.require('electron').ipcRenderer;
const MAX_THUMBNAILS_COUNT = 40;
const THUMBNAILS_FETCH_AMOUNT = 5;
const TOP_SCROLL_PER_THUMBNAIL = 2.8;

const useThumbnails = (defaultVal = []) => {
    const [thumbnails, _setThumbnails] = useState(defaultVal);

    const padShowAnnIconProp = (thumbs) =>
        thumbs.map((thumb) =>
            thumb.showAnnIcon === undefined
                ? {
                      ...thumb,
                      showAnnIcon: thumb.hasAnnotations || false,
                  }
                : thumb
        );

    const setThumbnails = (arg) => {
        if (typeof arg === 'function') {
            _setThumbnails((thumbnails) => padShowAnnIconProp(arg(thumbnails)));
        } else {
            _setThumbnails(padShowAnnIconProp(arg));
        }
    };

    return [thumbnails, setThumbnails];
};

/**
 * Component for displaying the lazy image menu.
 *
 * @component
 *
 */
function LazyImageMenuComponent() {
    const [thumbnails, setThumbnails] = useThumbnails([]);
    const isLazyMenuVisible = useSelector(getLazyImageMenuVisible);
    const currentFileName = useSelector(getCurrFileName);
    const [currChunk, setCurrChunk] = useState(0);
    const scrollContainerRef = useRef(null);
    const { length: annotationsCount } = useSelector(getAnnotations);
    const [prevFileName, setPrevFileName] = useState(currentFileName);
    const { selectedImagesDirPath, selectedAnnotationFile } =
        useSelector(getAssetsDirPaths);

    useEffect(() => {
        scrollContainerRef.current.scrollTop = 0;
    }, [selectedImagesDirPath, selectedAnnotationFile]);

    useEffect(() => {
        listenForThumbnailUpdates();
        ipcRenderer
            .invoke(Channels.requestInitialThumbnailsList)
            .then(setThumbnails)
            .catch(() => {
                // TODO: what should go in the lazy menu if no thumbnails are present?
                console.log('no thumbnails to begin with');
            });
    }, []);

    useEffect(() => {
        // update showAnnIcon when the annotation count changes
        setThumbnails(
            thumbnails.map((thumb) =>
                thumb.fileName === currentFileName
                    ? {
                          ...thumb,
                          showAnnIcon: !!annotationsCount,
                      }
                    : thumb
            )
        );
    }, [annotationsCount]);

    useEffect(() => {
        // if switch files, reflect the actual state of the previous file rather
        // than the previous redux one
        setThumbnails((thumbnails) =>
            thumbnails.map((thumb) =>
                thumb.fileName === prevFileName
                    ? {
                          ...thumb,
                          showAnnIcon: thumb.hasAnnotations,
                      }
                    : thumb
            )
        );
        setPrevFileName(currentFileName);
    }, [currentFileName]);

    const listenForThumbnailUpdates = () => {
        const {
            removeThumbnail,
            addThumbnail,
            updateThumbnails,
            updateThumbnailHasAnnotations,
        } = Channels;
        ipcRenderer
            .on(removeThumbnail, (e, removedThumbnailName) => {
                // must use a function here to get the most up-to-date state
                setThumbnails((thumbnails) =>
                    thumbnails.filter(
                        (thumbnail) =>
                            thumbnail.fileName !== removedThumbnailName
                    )
                );
            })
            .on(addThumbnail, (e, addedThumbnail) => {
                // must use a function here to get the most up-to-date state
                setThumbnails((thumbnails) => [...thumbnails, addedThumbnail]);
            })
            .on(updateThumbnails, (e, thumbnails) => {
                setThumbnails(thumbnails);
                setCurrChunk(0);
            })
            .on(
                updateThumbnailHasAnnotations,
                (e, { hasAnnotations, fileName }) => {
                    setThumbnails((thumbnails) =>
                        thumbnails.map((thumb) =>
                            thumb.fileName === fileName
                                ? {
                                      ...thumb,
                                      hasAnnotations,
                                      showAnnIcon: hasAnnotations,
                                  }
                                : thumb
                        )
                    );
                }
            );
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
                    .map(({ fileName, filePath, showAnnIcon }) => (
                        <LazyImageContainerComponent
                            key={fileName}
                            selected={fileName === currentFileName}
                            fileName={fileName}
                            filePath={filePath}
                            hasAnnotations={showAnnIcon}
                        />
                    ))}
            </LazyImagesContainer>
        </LazyImageMenuContainer>
    );
}

LazyImageMenuComponent.propTypes = {};

export default LazyImageMenuComponent;
