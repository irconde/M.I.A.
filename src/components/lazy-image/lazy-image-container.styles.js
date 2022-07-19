import styled from 'styled-components';
import React from 'react';

export const ImageContainer = styled.div`
    display: flex;
    border: ${(props) =>
        props.selected ? '4px solid #367eff' : '1px solid fff'};
    overflow-x: hidden;
    margin: 0 16px 60px 0;
    border-radius: 6px;
    background-color: #242424;
    justify-content: center;
    width: 197px;
    height: ${(props) =>
        props.loading === 'true' ? '145px' : `${props.thumbnailHeight}px`};
`;

export const LazyImageTextContainer = styled.div`
    display: flex;
    position: absolute;
    margin-top: 93%;
    flex-direction: row;
    flex-wrap: nowrap;
    align-content: center;
    justify-content: flex-start;
    width: 80%;
    cursor: default;
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
