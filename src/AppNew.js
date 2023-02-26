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
import SideMenuComponent from './components/side-menu/side-menu.component';
import ContactModal from './components/contact-modal/contact-modal.component';
import AnnotationContextMenuComponent from './components/annotation-context/annotation-context-menu.component';
import ColorPickerComponent from './components/color/color-picker.component';
import EditLabelComponent from './components/edit-label/edit-label.component';
import LazyImageMenuComponent from './components/lazy-image/lazy-image-menu.component';
import BoundPolyFABComponent from './components/fab/bound-poly-fab.component';
import SaveButtonComponent from './components/side-menu/buttons/save-button.component';
import {
    getShowApp,
    getSplashScreenVisibility,
    updateShowApp,
    updateSplashScreenVisibility,
} from './redux/slices/ui.slice';
import SplashScreenComponent from './components/splash-screen/splash-screen.component';

const AppNew = () => {
    const dispatch = useDispatch();
    const areSettingsLoading = useSelector(getSettingsLoadingState);
    const { selectedImagesDirPath } = useSelector(getAssetsDirPaths);
    const [prevSelectedImgDir, setPrevSelectedImgDir] = useState(
        selectedImagesDirPath
    );
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [aboutModalOpen, setAboutModalOpen] = useState(false);
    const [contactModalOpen, setContactModalOpen] = useState(false);
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
                        <>
                            <ImageDisplayComponent />
                            <TopBarComponent
                                openImportModal={() => setImportModalOpen(true)}
                                openContactModal={() =>
                                    setContactModalOpen(true)
                                }
                                openAboutModal={() => setAboutModalOpen(true)}
                            />
                            <AboutModal
                                open={aboutModalOpen}
                                setOpen={setAboutModalOpen}
                            />
                            <ContactModal
                                closeModal={() => setContactModalOpen(false)}
                                open={contactModalOpen}
                            />
                            <LazyImageMenuComponent />
                            <SideMenuComponent />
                            <AnnotationContextMenuComponent />
                            <ColorPickerComponent />
                            <EditLabelComponent />
                            <BoundPolyFABComponent />
                            <SaveButtonComponent />
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default AppNew;
