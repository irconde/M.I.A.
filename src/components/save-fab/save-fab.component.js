import React, { useState } from 'react';
import SaveAsIcon from '../../icons/save-fab/save-as-icon/save-as.icon';
import SaveIcon from '../../icons/save-fab/save-icon/save.icon';
import CloseIcon from '../../icons/settings-modal/close-icon/close.icon';
import FabIcon from '../../icons/save-fab/fab-icon/fab.icon';
import { FabButton, FabItem, FabWrapper } from './save-fab.styles';

const iconProps = {
    width: '24px',
    height: '24px',
    color: 'white',
};

const ExpandableFab = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleFabClick = () => {
        setIsExpanded(!isExpanded);
    };

    const handleSave = () => {
        console.log('Save');
    };

    const handleSaveAs = () => {
        console.log('Save As');
    };

    return (
        <FabWrapper>
            <FabItem index={1} expanded={isExpanded} onClick={handleSaveAs}>
                <SaveAsIcon {...iconProps} />
            </FabItem>
            <FabItem index={2} expanded={isExpanded} onClick={handleSave}>
                <SaveIcon {...iconProps} />
            </FabItem>
            <FabButton expanded={isExpanded} onClick={handleFabClick}>
                {isExpanded ? (
                    <CloseIcon {...iconProps} />
                ) : (
                    <FabIcon {...iconProps} />
                )}
            </FabButton>
        </FabWrapper>
    );
};

export default ExpandableFab;
