import React, { useEffect, useState } from 'react';
import ImportModalComponent from './components/import-modal/import-modal.component';
import {
    getAssetsDirPaths,
    getSettingsLoadingState,
    initSettings,
} from './redux/slices/settings.slice';
import { useDispatch, useSelector } from 'react-redux';
import {
    getShowApp,
    getSplashScreenVisibility,
    updateShowApp,
    updateSplashScreenVisibility,
} from './redux/slices/ui.slice';
import SplashScreenComponent from './components/splash-screen/splash-screen.component';
import ApplicationComponent from './components/application/application.component';

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
    }, []);

    useEffect(() => {
        // only open the modal if there is no selected images' dir path
        if (selectedImagesDirPath === '') {
            setImportModalOpen(true);
        } else if (selectedImagesDirPath && prevSelectedImgDir === undefined) {
            // on initial load, show the app if there's a path
            // checking for prev state ensures this only runs once
            dispatch(updateSplashScreenVisibility(true));
            dispatch(updateShowApp(true));
        }
        setPrevSelectedImgDir(selectedImagesDirPath);
    }, [selectedImagesDirPath]);

    return (
        <>
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
