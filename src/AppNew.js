import React, { useEffect } from 'react';
import ImportModalComponent from './components/import-modal/import-modal.component';
import { initSettings } from './redux/slices/settings/settings.slice';

const AppNew = () => {
    useEffect(() => {
        console.log('useEffect');
        console.log(initSettings());
    }, []);

    return (
        <div>
            <h1>New App JS!</h1>
            <ImportModalComponent />
        </div>
    );
};

export default AppNew;
