import styled from 'styled-components';
import React from 'react';
import { LAZY_SIDE_MENU_WIDTH } from './lazy-image-menu.styles';

const TEXT_BOX_HEIGHT = '2rem';
export const ImageContainer = styled.div`
    display: flex;
    flex-direction: column;
    border: ${({ selected }) =>
        selected ? '4px solid #367eff' : '1px solid fff'};
    overflow-x: hidden;
    margin-bottom: 60px;
    justify-content: center;
    width: ${LAZY_SIDE_MENU_WIDTH};
    height: ${(props) =>
        props.loading ? '145px' : `${props.thumbnailHeight}px`};
`;

export const LazyImageTextContainer = styled.div`
    height: ${TEXT_BOX_HEIGHT};
    display: flex;
    align-items: center;
`;

export const LazyImageText = styled.span`
    display: inline-block;
    opacity: 0.6;
    font-size: 12px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: -0.5px;
    color: #e3e3e3;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 117px;
    margin-right: 4px;
`;

export const ThumbnailContainer = styled.div`
    display: flex;
    cursor: pointer;
    border-radius: 6px;
`;

export const LazyImageIconWrapper = styled.div`
    margin-right: 4px;
    margin-left: 4px;
    display: flex;
`;
