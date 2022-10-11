import React, { useEffect } from 'react';
import ImportModalComponent from './components/import-modal/import-modal.component';
import {
    getAssetsDirPaths,
    getSettingsLoadingState,
    initSettings,
} from './redux/slices/settings/settings.slice';
import { useDispatch, useSelector } from 'react-redux';
import ImageDisplayComponent from './components/image-display/image-display.component';

const AppNew = () => {
    const dispatch = useDispatch();
    const areSettingsLoading = useSelector(getSettingsLoadingState);
    const { selectedImagesDirPath, selectedAnnotationsDirPath } =
        useSelector(getAssetsDirPaths);

    useEffect(() => {
        dispatch(initSettings());
    }, []);

    console.log(selectedImagesDirPath);

    return (
        <div>
            {!areSettingsLoading &&
                (selectedImagesDirPath === '' ? (
                    <ImportModalComponent />
                ) : (
                    <ImageDisplayComponent />
                ))}
        </div>
    );
};

export default AppNew;
