import React, { useEffect, useState } from 'react';
import ImportModalComponent from './components/import-modal/import-modal.component';
import {
    getAssetsDirPaths,
    getSettingsLoadingState,
    initSettings,
} from './redux/slices/settings.slice';
import { useDispatch, useSelector } from 'react-redux';
import ImageDisplayComponent from './components/image-display/image-display.component';
import TopBarComponent from './components/top-bar/top-bar.component';
import AboutModal from './components/about-modal/about-modal.component';
import { Channels } from './utils/enums/Constants';

const ipcRenderer = window.require('electron').ipcRenderer;

const AppNew = () => {
    const dispatch = useDispatch();
    const areSettingsLoading = useSelector(getSettingsLoadingState);
    const { selectedImagesDirPath, selectedAnnotationFile } =
        useSelector(getAssetsDirPaths);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [aboutModalOpen, setAboutModalOpen] = useState(false);

    useEffect(() => {
        // TODO: move this to lazy image component
        addElectronChannels();
        dispatch(initSettings());
    }, []);

    useEffect(() => {
        // only open the modal if there is no selected images' dir path
        selectedImagesDirPath === '' && setImportModalOpen(true);
    }, [selectedImagesDirPath]);

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
            })
            .catch(() => {
                console.log('no thumbnails to begin with');
            });
    };

    return (
        <div>
            {!areSettingsLoading && (
                <>
                    <ImportModalComponent
                        open={importModalOpen}
                        setOpen={setImportModalOpen}
                    />
                    <ImageDisplayComponent />
                </>
            )}
            <TopBarComponent
                openImportModal={() => setImportModalOpen(true)}
                openAboutModal={() => setAboutModalOpen(true)}
            />
            <AboutModal open={aboutModalOpen} setOpen={setAboutModalOpen} />
        </div>
    );
};

export default AppNew;
