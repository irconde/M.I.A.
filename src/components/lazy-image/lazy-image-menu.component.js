import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { getCollapsedLazyMenu } from '../../redux/slices-old/ui/uiSlice';
import { Channels } from '../../utils/enums/Constants';
import Utils from '../../utils/general/Utils';
import LazyImageContainer from './lazy-image-container.component';
import {
    FolderIconWrapper,
    ImagesInWorkspace,
    LazyImageMenuContainer,
    LazyImageMenuPadding,
    LazyImagesContainer,
} from './lazy-image-menu.styles';
import FolderIcon from '../../icons/shared/folder-icon/folder.icon';
import { initSettings } from '../../redux/slices/settings.slice';

const ipcRenderer = window.require('electron').ipcRenderer;

/**
 * Component for displaying the lazy image menu.
 *
 * @component
 *
 */
function LazyImageMenuComponent(props) {
    const [thumbnails, setThumbnails] = useState([]);

    useEffect(() => {
        // TODO: move this to lazy image component
        addElectronChannels();
        dispatch(initSettings());
    }, []);
    const dispatch = useDispatch();
    // ipcRenderer.on(constants.Channels.thumbnailStatus, (event, status) => {
    //     dispatch(setGeneratingThumbnails(status));
    // });
    // const enableMenu = useSelector(getLocalFileOpen);
    const enableMenu = true;
    const collapsedLazyMenu = useSelector(getCollapsedLazyMenu);
    const [translateStyle, setTranslateStyle] = useState({
        transform: `translate(0)`,
    });
    const prevIsMenuCollapsed = Utils.usePrevious(collapsedLazyMenu);
    useEffect(() => {
        if (prevIsMenuCollapsed !== collapsedLazyMenu) {
            if (collapsedLazyMenu === true) {
                setTranslateStyle({
                    transform: `translate(${-Math.abs(256 + 10)}px)`,
                });
            } else {
                setTranslateStyle({
                    transform: `translate(0)`,
                });
            }
        }
    });

    const addElectronChannels = () => {
        const {
            removeThumbnail,
            addThumbnail,
            updateThumbnails,
            requestInitialThumbnailsList,
        } = Channels;
        ipcRenderer.on(removeThumbnail, (e, removedThumbnail) => {
            console.log('REMOVE');
            console.log(removedThumbnail);
        });
        ipcRenderer.on(addThumbnail, (e, addedThumbnail) => {
            console.log('ADDED');
            console.log(addedThumbnail);
        });
        ipcRenderer.on(updateThumbnails, (e, thumbnailsObj) => {
            console.log('UPDATE');
            console.log(thumbnailsObj);
        });
        ipcRenderer
            .invoke(requestInitialThumbnailsList)
            .then((thumbnails) => {
                console.log('INIT');
                console.log(thumbnails);
                setThumbnails(thumbnails);
            })
            .catch(() => {
                console.log('no thumbnails to begin with');
            });
    };

    // change piece of state when the user scrolls. Used for adding box-shadow to header
    const [shouldAddBoxShadow, setShouldAddBoxShadow] = useState(false);

    function handleMenuContainerScroll(event) {
        const element = event.target;
        if (element.scrollTop > 0) {
            setShouldAddBoxShadow(true);
        } else {
            setShouldAddBoxShadow(false);
        }
    }

    if (!enableMenu) return;

    if (collapsedLazyMenu) {
        return (
            <LazyImageMenuContainer
                onScroll={handleMenuContainerScroll}
                translateStyle={translateStyle}>
                <LazyImageMenuPadding />
                <LazyImagesContainer collapsedLazyMenu={collapsedLazyMenu} />
            </LazyImageMenuContainer>
        );
    } else if (!collapsedLazyMenu) {
        return (
            <LazyImageMenuContainer
                onScroll={handleMenuContainerScroll}
                translateStyle={translateStyle}>
                <ImagesInWorkspace shouldAddBoxShadow={shouldAddBoxShadow}>
                    <FolderIconWrapper>
                        <FolderIcon
                            width={'24px'}
                            height={'24px'}
                            color={'white'}
                        />
                    </FolderIconWrapper>
                    Images in Workspace
                </ImagesInWorkspace>
                {/*<LazyImagesContainer collapsedLazyMenu={collapsedLazyMenu}>*/}
                {/*    {props.thumbnails !== null*/}
                {/*        ? props.thumbnails.map((file, index) => {*/}
                {/*              return (*/}
                {/*                  <LazyImageContainer*/}
                {/*                      getSpecificFileFromLocalDirectory={*/}
                {/*                          props.getSpecificFileFromLocalDirectory*/}
                {/*                      }*/}
                {/*                      key={index}*/}
                {/*                      file={file}*/}
                {/*                  />*/}
                {/*              );*/}
                {/*          })*/}
                {/*        : null}*/}
                {/*</LazyImagesContainer>*/}
                <LazyImagesContainer collapsedLazyMenu={collapsedLazyMenu}>
                    {thumbnails.map((file, index) => (
                        <LazyImageContainer
                            getSpecificFileFromLocalDirectory={
                                props.getSpecificFileFromLocalDirectory
                            }
                            key={index}
                            file={file}
                        />
                    ))}
                </LazyImagesContainer>
            </LazyImageMenuContainer>
        );
    }
}

LazyImageMenuComponent.propTypes = {
    /**
     * Array with string values to the file path of thumbnails,
     * IE: ['D:\images\.thumbnails\1_img.ora_thumbnail.png', 'D:\images\.thumbnails\2_img.ora_thumbnail.png', ...]
     */
    thumbnails: PropTypes.array,
    /**
     * Calls the Electron channel to invoke a specific file from the selected file system folder.
     */
    getSpecificFileFromLocalDirectory: PropTypes.func,
};

export default LazyImageMenuComponent;
