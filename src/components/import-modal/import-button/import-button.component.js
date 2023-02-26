import SpinnerIcon from '../../../icons/import-modal/spinner-icon/spinner.icon';
import { ConfirmButton, IconWrapper } from './import-button.styles';
import SaveArrowIcon from '../../../icons/side-menu/save-arrow-icon/save-arrow.icon';
import useThumbnailsLoading from '../../../utils/hooks/thumbnails-loading.hook';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import CheckMarkIcon from '../../../icons/import-modal/check-mark-icon/check-mark.icon';
import { useDispatch } from 'react-redux';
import {
    updateShowApp,
    updateSplashScreenVisibility,
} from '../../../redux/slices/ui.slice';

const iconProps = {
    width: '36px',
    height: '36px',
    color: 'white',
};

const CLOSE_MODAL_DELAY = 1000;

function ImportButtonComponent({ handleClick, setOpen, paths }) {
    const areThumbnailsLoading = useThumbnailsLoading(false);
    const [prevLoading, setPrevLoading] = useState(areThumbnailsLoading);
    const [success, setSuccess] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!prevLoading && areThumbnailsLoading) {
            // when loading
            dispatch(updateShowApp(false));
        } else if (prevLoading && !areThumbnailsLoading) {
            // when done loading thumbnails
            setSuccess(true);
            setTimeout(() => {
                setOpen(false);
                console.log('SHOW AFTER LOADING IS DONE');
                dispatch(updateSplashScreenVisibility(true));
                dispatch(updateShowApp(true));
            }, CLOSE_MODAL_DELAY);
        }
        setPrevLoading(areThumbnailsLoading);
    }, [areThumbnailsLoading]);

    const renderBtnContents = () => {
        let icon;
        let text;
        if (success) {
            text = 'DATA IMPORTED';
            icon = <CheckMarkIcon {...iconProps} />;
        } else if (areThumbnailsLoading) {
            text = 'IMPORTING DATA';
            icon = <SpinnerIcon {...iconProps} />;
        } else {
            text = 'CONFIRM DATA IMPORT';
            icon = <SaveArrowIcon {...iconProps} />;
        }

        return (
            <>
                {text}
                <IconWrapper>{icon}</IconWrapper>
            </>
        );
    };

    return (
        <ConfirmButton
            onClick={handleClick}
            $success={success}
            disabled={
                !paths.images.trim() ||
                paths.isLoading ||
                !!paths.annotationsError ||
                !!paths.imagesError
            }>
            {renderBtnContents()}
        </ConfirmButton>
    );
}

ImportButtonComponent.propTypes = {
    paths: PropTypes.object.isRequired,
    setOpen: PropTypes.func.isRequired,
    handleClick: PropTypes.func.isRequired,
};

export default ImportButtonComponent;
