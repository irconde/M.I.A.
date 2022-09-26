import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
    getCollapsedSideMenu,
    getConfigInfo,
} from '../../redux/slices-old/ui/uiSlice';
import { getSelectedAlgorithm } from '../../redux/slices-old/detections/detectionsSlice';
import {
    InlineSlash,
    MetaDataGroup,
    MetaDataText,
    StyledMetaData,
} from './meta-data.styles';

import InfoIcon from '../../icons/shared/info-icon/info.icon';

/**
 * @component
 *
 * GUI widget that provides the user with information regarding a particular
 * object detection algorithm
 *
 */
const MetaDataComponent = () => {
    const selectedAlgorithm = useSelector(getSelectedAlgorithm);
    const isVisible = selectedAlgorithm !== '' ? true : false;
    const configInfo = useSelector(getConfigInfo);
    const sideMenuCollapsed = useSelector(getCollapsedSideMenu);

    if (!isVisible) {
        return <></>;
    } else {
        return (
            <StyledMetaData sideMenuCollapsed={sideMenuCollapsed} id="Metadata">
                <InfoIcon
                    width="24px"
                    height="24px"
                    color="white"
                    id="InfoIcon"
                />
                <MetaDataGroup>
                    <MetaDataText>Detector Type:</MetaDataText>
                    <MetaDataText> {configInfo.detectorType}</MetaDataText>
                </MetaDataGroup>
                <InlineSlash>/</InlineSlash>
                <MetaDataGroup>
                    <MetaDataText>Detector Configuration:</MetaDataText>
                    <MetaDataText>
                        {' '}
                        {configInfo.detectorConfigType}
                    </MetaDataText>
                </MetaDataGroup>
                <InlineSlash>/</InlineSlash>
                <MetaDataGroup>
                    <MetaDataText>Series:</MetaDataText>
                    <MetaDataText> {configInfo.seriesType}</MetaDataText>
                </MetaDataGroup>
                <InlineSlash>/</InlineSlash>
                <MetaDataGroup>
                    <MetaDataText>Study:</MetaDataText>
                    <MetaDataText> {configInfo.studyType}</MetaDataText>
                </MetaDataGroup>
            </StyledMetaData>
        );
    }
};

MetaDataComponent.propTypes = {
    isVisible: PropTypes.bool,
};

export default MetaDataComponent;
