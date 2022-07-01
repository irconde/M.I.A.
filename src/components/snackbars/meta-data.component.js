import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
    getCollapsedSideMenu,
    getConfigInfo,
} from '../../redux/slices/ui/uiSlice';
import { getSelectedAlgorithm } from '../../redux/slices/detections/detectionsSlice';
import {
    InlineSlash,
    MetaDataText,
    MetaDataGroup,
    StyledMetaData,
} from './meta-data.styles';

import { Info } from '../side-menu/Icons';

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
            <StyledMetaData sideMenuCollapsed={sideMenuCollapsed}>
                <Info style={{ verticalAlign: 'text-top' }} />
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
