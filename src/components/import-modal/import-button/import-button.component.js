import SpinnerIcon from '../../../icons/import-modal/spinner-icon/spinner.icon';
import { ConfirmButton, IconWrapper } from '../import-modal.styles';
import SaveArrowIcon from '../../../icons/side-menu/save-arrow-icon/save-arrow.icon';
import useThumbnailsLoading from '../../../utils/hooks/thumbnails-loading.hook';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import CheckMarkIcon from '../../../icons/import-modal/check-mark-icon/check-mark.icon';

const iconProps = {
    width: '36px',
    height: '36px',
    color: 'white',
};

function ImportButtonComponent({ handleClick, setOpen, paths }) {
    const areThumbnailsLoading = useThumbnailsLoading(false);
    const [prevLoading, setPrevLoading] = useState(areThumbnailsLoading);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (prevLoading && !areThumbnailsLoading) {
            setSuccess(true);
            setTimeout(() => setOpen(false), 1000);
        }
        setPrevLoading(areThumbnailsLoading);
    }, [areThumbnailsLoading]);

    const renderButton = () => {
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
            {renderButton()}
        </ConfirmButton>
    );
}

ImportButtonComponent.propTypes = {
    paths: PropTypes.object.isRequired,
    setOpen: PropTypes.func.isRequired,
    handleClick: PropTypes.func.isRequired,
};

export default ImportButtonComponent;
