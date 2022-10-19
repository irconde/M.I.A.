import React, { useEffect, useState } from 'react';
import ImportModalComponent from './components/import-modal/import-modal.component';
import {
    getAssetsDirPaths,
    getSettingsLoadingState,
    initSettings,
} from './redux/slices/settings/settings.slice';
import { useDispatch, useSelector } from 'react-redux';
import ImageDisplayComponent from './components/image-display/image-display.component';
import TopBarComponent from './components/top-bar/top-bar.component';

const AppNew = () => {
    const dispatch = useDispatch();
    const areSettingsLoading = useSelector(getSettingsLoadingState);
    const { selectedImagesDirPath, selectedAnnotationsDirPath } =
        useSelector(getAssetsDirPaths);
    const [importModalOpen, setImportModalOpen] = useState(
        !!selectedImagesDirPath
    );

    useEffect(() => {
        dispatch(initSettings());
    }, []);
    useEffect(() => {}, [importModalOpen]);

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
            <TopBarComponent openImportModal={() => setImportModalOpen(true)} />
        </div>
    );
};

export default AppNew;
