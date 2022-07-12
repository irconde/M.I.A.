import React from 'react';
import PropTypes from 'prop-types';
import {
    VisualizationModeIconWrapper,
    VisualizationModeContainer,
    VisualizationModeLabel,
} from './visualization-mode-picker.styles';
import {
    SettingOptionTitle,
    SettingDescription,
} from '../settings-modal.styles';

import SummarizedModeIcon from '../../../icons/settings-modal/summarized-mode-icon/summarized-mode.icon';
import SummarizedModeCheckedIcon from '../../../icons/settings-modal/summarized-mode-checked-icon/summarized-mode-checked.icon';
import DetailedModeIcon from '../../../icons/settings-modal/detailed-mode-icon/detailed-mode.icon';
import DetailedModeCheckedIcon from '../../../icons/settings-modal/detailed-mode-checked-icon/detailed-mode-checked.icon';

const IconProps = {
    height: '8rem',
    width: '8rem',
    color: 'white',
};

const VisualizationModePickerComponent = ({
    isSummarized,
    setIsSummarized,
}) => {
    return (
        <div>
            <SettingOptionTitle>Visualization Mode</SettingOptionTitle>
            <SettingDescription>
                Pick the visual granularity to use when displaying
                multi-algorithm results.
            </SettingDescription>
            <VisualizationModeContainer>
                <div>
                    <VisualizationModeIconWrapper
                        selected={!isSummarized}
                        onClick={() => {
                            setIsSummarized(false);
                        }}>
                        {isSummarized ? (
                            <DetailedModeIcon {...IconProps} />
                        ) : (
                            <DetailedModeCheckedIcon {...IconProps} />
                        )}
                    </VisualizationModeIconWrapper>

                    <VisualizationModeLabel selected={!isSummarized}>
                        Detailed
                    </VisualizationModeLabel>
                </div>
                <div>
                    <VisualizationModeIconWrapper
                        selected={isSummarized}
                        onClick={() => {
                            setIsSummarized(true);
                        }}>
                        {!isSummarized ? (
                            <SummarizedModeIcon {...IconProps} />
                        ) : (
                            <SummarizedModeCheckedIcon {...IconProps} />
                        )}
                    </VisualizationModeIconWrapper>
                    <VisualizationModeLabel selected={isSummarized}>
                        Summarized
                    </VisualizationModeLabel>
                </div>
            </VisualizationModeContainer>
        </div>
    );
};

VisualizationModePickerComponent.propTypes = {
    isSummarized: PropTypes.bool.isRequired,
    setIsSummarized: PropTypes.func.isRequired,
};

export default VisualizationModePickerComponent;
