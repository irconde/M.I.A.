import React, { useEffect, useState } from 'react';
import ImageDisplayComponent from '../image-display/image-display.component';
import TopBarComponent from '../top-bar/top-bar.component';
import AboutModal from '../about-modal/about-modal.component';
import ContactModal from '../contact-modal/contact-modal.component';
import LazyImageMenuComponent from '../lazy-image/lazy-image-menu.component';
import SideMenuComponent from '../side-menu/side-menu.component';
import AnnotationContextMenuComponent from '../annotation-context/annotation-context-menu.component';
import EditLabelComponent from '../edit-label/edit-label.component';
import BoundPolyFABComponent from '../fab/bound-poly-fab.component';

import PropTypes from 'prop-types';
import {
    clearAnnotationWidgets,
    updateCornerstoneMode,
    updateCurrFileName,
    updateFABVisibility,
    updateSplashScreenVisibility,
} from '../../redux/slices/ui.slice';
import { useDispatch } from 'react-redux';
import SaveFabComponent from '../save-fab/save-fab.component';
import ImageToolsFabComponent from '../image-tools-fab/image-tools-fab.component';
import { Channels, cornerstoneMode } from '../../utils/enums/Constants';
import Utils from '../../utils/general/Utils';

const SPLASH_SCREEN_DELAY = 2000;
const ipcRenderer = window.require('electron').ipcRenderer;

function ApplicationComponent({ openImportModal }) {
    const [aboutModalOpen, setAboutModalOpen] = useState(false);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        // hide the splash screen on mount
        setTimeout(
            () =>
                requestAnimationFrame(() =>
                    dispatch(updateSplashScreenVisibility(false))
                ),
            SPLASH_SCREEN_DELAY
        );

        ipcRenderer.on(Channels.newFileUpdate, (e, args) => {
            dispatch(clearAnnotationWidgets());
            dispatch(updateFABVisibility(true));
            dispatch(updateCornerstoneMode(cornerstoneMode.SELECTION));
            const viewport = document.getElementById('imageContainer');
            if (viewport !== null) {
                Utils.resetCornerstoneTools(viewport);
            }
            Utils.dispatchAndUpdateImage(
                dispatch,
                updateCurrFileName,
                args.currentFileName
            );
        });
    }, []);

    return (
        <>
            <ImageDisplayComponent />
            <TopBarComponent
                openImportModal={openImportModal}
                openContactModal={() => setContactModalOpen(true)}
                openAboutModal={() => setAboutModalOpen(true)}
            />
            <AboutModal open={aboutModalOpen} setOpen={setAboutModalOpen} />
            <ContactModal
                closeModal={() => setContactModalOpen(false)}
                open={contactModalOpen}
            />
            <LazyImageMenuComponent />
            <SideMenuComponent />
            <AnnotationContextMenuComponent />
            <EditLabelComponent />
            <BoundPolyFABComponent />

            <ImageToolsFabComponent />
            <SaveFabComponent />
        </>
    );
}

ApplicationComponent.propTypes = {
    openImportModal: PropTypes.func.isRequired,
};

export default ApplicationComponent;
