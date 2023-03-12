import React, { useEffect, useState } from 'react';
import ImportModalComponent from './components/import-modal/import-modal.component';
import {
    getAssetsDirPaths,
    getSettingsLoadingState,
    initSettings,
    updateAnnotationFile,
} from './redux/slices/settings.slice';
import { useDispatch, useSelector } from 'react-redux';
import { Channels } from './utils/enums/Constants';
import {
    getShowApp,
    getSplashScreenVisibility,
    updateShowApp,
    updateSplashScreenVisibility,
} from './redux/slices/ui.slice';
import SplashScreenComponent from './components/splash-screen/splash-screen.component';
import ApplicationComponent from './components/application/application.component';
import CloseModalComponent from './components/close-modal/close-modal.component';

const ipcRenderer = window.require('electron').ipcRenderer;

const AppNew = () => {
    const dispatch = useDispatch();
    const areSettingsLoading = useSelector(getSettingsLoadingState);
    const { selectedImagesDirPath } = useSelector(getAssetsDirPaths);
    const [prevSelectedImgDir, setPrevSelectedImgDir] = useState(
        selectedImagesDirPath
    );
    const [importModalOpen, setImportModalOpen] = useState(false);

    const showApp = useSelector(getShowApp);
    const showSplashScreen = useSelector(getSplashScreenVisibility);

    useEffect(() => {
        dispatch(initSettings());
        ipcRenderer.on(Channels.updateAnnotationFile, (e, data) => {
            console.log(data);
            dispatch(updateAnnotationFile(data));
        });
    }, []);

    useEffect(() => {
        // hide the splash screen when the import modal is visible
        if (!importModalOpen) return;
        setTimeout(() => dispatch(updateSplashScreenVisibility(false)), 2000);
    }, [importModalOpen]);

    useEffect(() => {
        // only open the modal if there is no selected images' dir path
        if (selectedImagesDirPath === '') {
            setImportModalOpen(true);
        } else if (selectedImagesDirPath && prevSelectedImgDir === undefined) {
            // show the app if there is a path saved in the settings file
            dispatch(updateSplashScreenVisibility(true));
            dispatch(updateShowApp(true));
        }
        setPrevSelectedImgDir(selectedImagesDirPath);
    }, [selectedImagesDirPath]);

    return (
        <>
            <CloseModalComponent />
            {showSplashScreen && <SplashScreenComponent />}
            {!areSettingsLoading && (
                <div>
                    <ImportModalComponent
                        open={importModalOpen}
                        setOpen={setImportModalOpen}
                    />
                    {selectedImagesDirPath && showApp && (
                        <ApplicationComponent
                            openImportModal={() => setImportModalOpen(true)}
                        />
                    )}
                </div>
            )}
        </>
    );
};

export default AppNew;
