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

const AppNew = () => {
    const dispatch = useDispatch();
    const areSettingsLoading = useSelector(getSettingsLoadingState);
    const { selectedImagesDirPath, selectedAnnotationFile } =
        useSelector(getAssetsDirPaths);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [aboutModalOpen, setAboutModalOpen] = useState(false);

    useEffect(() => {
        dispatch(initSettings());
    }, []);

    useEffect(() => {
        // only open the modal if there is no selected images' dir path
        selectedImagesDirPath === '' && setImportModalOpen(true);
    }, [selectedImagesDirPath]);

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
