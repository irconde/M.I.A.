import styled from 'styled-components';
import { LAZY_SIDE_MENU_WIDTH } from './lazy-image-menu.styles';
import { colors } from '../../utils/enums/Constants';

const TEXT_CONTAINER_HEIGHT = '2.5rem';
const IMAGE_HEIGHT = '149px';
const IMAGE_WIDTH = '197px';
const IMAGE_PLACEHOLDER_COLOR = '#626262';

export const ImageContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: 0.2rem;
    align-items: center;
    width: ${LAZY_SIDE_MENU_WIDTH};
    height: calc(${IMAGE_HEIGHT} + ${TEXT_CONTAINER_HEIGHT});
`;

export const ThumbnailContainer = styled.div`
    display: flex;
    cursor: pointer;
    position: relative;
    outline: ${({ selected }) =>
        selected ? '2px solid #367eff' : '1px solid #979797'};
    height: ${IMAGE_HEIGHT};
    width: ${IMAGE_WIDTH};
    background-color: ${IMAGE_PLACEHOLDER_COLOR};

    transition: ${({ selected }) => !selected && 'outline-color 100ms'};

    :hover {
        outline: ${({ selected }) => !selected && '1px solid white'};
    }

    img {
        object-fit: cover;
    }
`;

export const LazyImageTextContainer = styled.div`
    height: ${TEXT_CONTAINER_HEIGHT};
    display: flex;
    align-items: center;
    width: 197px;
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
    font-family: 'Noto Sans JP', serif;
`;

export const LazyImageIconWrapper = styled.div`
    position: absolute;
    display: flex;
    width: 2rem;
    aspect-ratio: 1;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: ${colors.BLUE};
    padding: 0.2rem;
    bottom: 0;
    right: 0;
    transform: translate(30%, 30%);
    box-shadow: -1px -1px 13px 1px rgba(0, 0, 0, 0.3);
`;
