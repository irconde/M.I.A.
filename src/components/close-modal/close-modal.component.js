import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Channels } from '../../utils/enums/Constants';

const ipcRenderer = window.require('electron').ipcRenderer;

function CloseModalComponent() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        ipcRenderer.on(Channels.closeApp, () => setIsOpen(true));
    }, []);

    const handleYes = () => {
        ipcRenderer.invoke(Channels.closeApp).then();
    };

    return (
        isOpen && (
            <div
                style={{
                    zIndex: 10000,
                    background: 'rgba(0,0,0, 0.6)',
                    width: '100vw',
                    height: '100vh',
                    position: 'absolute',
                    display: 'flex',
                    placeItems: 'center',
                }}>
                <p>Are you sure you want to terminate the app?</p>
                <button onClick={() => setIsOpen(false)}>No</button>
                <button onClick={handleYes}>Yes</button>
            </div>
        )
    );
}

CloseModalComponent.propTypes = {};

export default CloseModalComponent;
