import React, { useEffect } from 'react';
import ImportModalComponent from './components/import-modal/import-modal.component';
import {
    getSettingsLoadingState,
    initSettings,
} from './redux/slices/settings/settings.slice';
import { useDispatch, useSelector } from 'react-redux';

const AppNew = () => {
    const dispatch = useDispatch();
    const areSettingsLoading = useSelector(getSettingsLoadingState);

    useEffect(() => {
        dispatch(initSettings());
    }, []);

    return (
        <div>
            {areSettingsLoading ? (
                <h2>Loading...</h2>
            ) : (
                <>
                    <h1>New App JS!</h1>
                    <ImportModalComponent />
                </>
            )}
        </div>
    );
};

export default AppNew;
