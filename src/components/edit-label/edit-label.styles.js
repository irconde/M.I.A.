import styled, { css } from 'styled-components';
import * as constants from '../../utils/enums/Constants';

const MIN_LABEL_WIDTH = '140px';

export const InputContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    height: fit-content;
    min-height: 100%;
    width: 100%;
    position: relative;
`;
export const EditLabelWrapper = styled.div`
    position: absolute;
    display: flex;
    min-width: calc(
        ${MIN_LABEL_WIDTH} * ${({ zoomLevel }) => Math.max(1, zoomLevel)}
    );
    z-index: 500;
    width: ${(props) => `${props.width}px`};
    left: ${(props) => `${props.left}px`};
    top: ${(props) => `${props.top}px`};
    min-height: 24px;
    height: ${({ zoomLevel }) => `calc(${zoomLevel} * 24px * 0.84)`};

    transform: translateY(
        calc(-100% + 24px + (1px * ${({ zoomLevel }) => zoomLevel}))
    );
    background: ${constants.colors.BLUE};

    input {
        ${({ zoomLevel }) => css`
            padding-left: calc(5px * ${zoomLevel});
            padding-top: calc(3px * ${zoomLevel});
            font-size: calc(12px * ${Math.max(zoomLevel, 1)});
            height: ${({ zoomLevel }) => `calc(${zoomLevel} * 24px * 0.84)`};
        `}
    }
`;

export const ArrowIconWrapper = styled.div`
    display: grid;
    place-items: center;
    aspect-ratio: 1 / 1;
    height: 100%;
    cursor: pointer;
    background-color: ${constants.colors.BLUE};
`;

export const NewLabelInput = styled.input`
    background-color: transparent;
    font-family: 'Arial', 'sans-serif';
    font-weight: 600;

    color: ${constants.colors.WHITE};
    border: none;
    user-select: none;
    width: 100%;
    height: 100%;
    padding-right: 1.5rem;
    box-sizing: border-box;

    &:disabled {
        background-color: rgba(0, 0, 0, 0.35);
    }

    &:focus {
        border-color: ${constants.colors.BLUE};
        outline: 0;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
            0 0 8px rgba(102, 175, 233, 0.6);
    }

    &::placeholder {
        color: #e0e0e0;
    }
`;

export const ClearIconWrapper = styled.div`
    height: 20px;
    position: absolute;
    right: 2px;
    width: fit-content;
    cursor: pointer;
    vertical-align: text-top;
`;

export const INPUT_HEIGHT = 24;
