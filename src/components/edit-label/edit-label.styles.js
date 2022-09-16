import styled from 'styled-components';
import * as constants from '../../utils/enums/Constants';

export const EditLabelWrapper = styled.div`
    position: absolute;
    min-width: 120px;
    z-index: 500;
    width: ${(props) => `${props.width}px`};
    left: ${(props) => `${props.left}px`};
    top: ${(props) => `${props.top}px`};
    background: ${constants.colors.BLUE};
`;

export const InputContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 1.5rem;
    width: 100%;
    position: relative;
`;

export const ArrowIconWrapper = styled.div`
    display: flex;
    cursor: pointer;
`;

export const NewLabelInput = styled.input`
    background-color: transparent;
    font-family: 'Arial', 'sans-serif';
    font-weight: 500;

    color: ${constants.colors.WHITE};
    border: none;
    user-select: none;
    width: 100%;
    height: 100%;
    padding-right: 1.5rem;

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
