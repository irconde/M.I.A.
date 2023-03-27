import SpinnerIcon from '../../../icons/shared/spinner-icon/spinner.icon';
import { ConfirmButton, IconWrapper } from './import-button.styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import CheckMarkIcon from '../../../icons/import-modal/check-mark-icon/check-mark.icon';
import { useDispatch } from 'react-redux';
import { updateShowApp } from '../../../redux/slices/ui.slice';
import ConfirmImportIcon from '../../../icons/import-modal/confirm-import-icon/confirm-import.icon';

const iconProps = {
    width: '20px',
    height: '20px',
    color: 'white',
};

const CLOSE_MODAL_DELAY = 1000;

function ImportButtonComponent({
    handleClick,
    setOpen,
    paths,
    areThumbnailsLoading,
    showCloseIcon,
}) {
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
            dispatch(updateShowApp(true));
            setTimeout(() => {
                setOpen(false);
                showCloseIcon();
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
            icon = <ConfirmImportIcon {...iconProps} />;
        }

        return (
            <>
                <span>{text}</span>
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
    areThumbnailsLoading: PropTypes.bool.isRequired,
    showCloseIcon: PropTypes.func.isRequired,
};

export default ImportButtonComponent;
