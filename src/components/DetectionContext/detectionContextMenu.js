import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { ReactComponent as DeleteIcon } from '../../icons/ic_delete.svg';
import { ReactComponent as TextIcon } from '../../icons/ic_text_label.svg';
import { ReactComponent as PolygonIcon } from '../../icons/ic_polygon_dark.svg';
import { ReactComponent as RectangleIcon } from '../../icons/ic_rectangle_dark.svg';

const Container = styled.div`
    display: flex;
    align-items: center;
`;
const MainWidget = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 10px;
    padding-right: 10px;
    height: 30px;
    width: 75px;
    justify-content: center;
    border-radius: 40px;
    background-color: #dadada;

    & > * {
        margin-right: 2px;
        margin-left: 2px;
    }
    .divider {
        height: 25px;
        border-left: 1px solid #aaa;
        margin-left: 4px;
        margin-right: 4px;
    }

    svg {
        transform: scale(1.25);
    }
`;
const DeleteWidget = styled.div`
    height: 30px;
    width: 30px;
    border-radius: 15px;
    display: flex;
    margin-left: 0.45rem;
    align-items: center;
    justify-content: center;
    background-color: #dadada;
`;
function DetectionContextMenu({ isOpen }) {
    return (
        isOpen && (
            <Container>
                <MainWidget>
                    <TextIcon />
                    <div className="divider" />
                    <RectangleIcon />
                    <div className="divider" />
                    <PolygonIcon />
                </MainWidget>
                <DeleteWidget>
                    <DeleteIcon />
                </DeleteWidget>
            </Container>
        )
    );
}

DetectionContextMenu.propTypes = {
    isOpen: PropTypes.bool.isRequired,
};

export default DetectionContextMenu;
