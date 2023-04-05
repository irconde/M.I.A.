import styled from 'styled-components';
import * as constants from '../../utils/enums/Constants';

const LABEL_WIDTH = '182px';

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
    align-items: center;

    min-width: ${LABEL_WIDTH};
    min-height: 28px;
    z-index: 500;
    width: ${(props) => `${props.width}px`};
    left: ${(props) => `${props.left}px`};
    top: ${(props) => `${props.top}px`};

    background: ${constants.colors.BLUE};

    input {
        min-height: 24px;
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
    font-family: 'Noto Sans JP', 'sans-serif';
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
