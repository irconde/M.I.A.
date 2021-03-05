import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { ReactComponent as DeleteIcon } from '../../icons/ic_delete.svg';
import { ReactComponent as TextIcon } from '../../icons/ic_text_label.svg';
import { ReactComponent as PolygonIcon } from '../../icons/ic_polygon_dark.svg';
import { ReactComponent as RectangleIcon } from '../../icons/ic_rectangle_dark.svg';
import { editionMode } from '../../Constants';

// Some useful style constants
const widgetHeight = '30px';
const white = '#dadada';
const selectedColor = '#aeaeae';

const Positioner = styled.div`
    position: absolute;
    top: ${(props) => `${props.position.top}px`};
    z-index: 500;
`;
const FlexContainer = styled.div`
    display: flex;
    align-items: center;
`;
const MainWidget = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${widgetHeight};
    border-radius: 40px;
    background-color: ${white};
    overflow: hidden;
    box-shadow: 5px 5px 15px 2px rgba(0, 0, 0, 0.41);
    /* make sure when either icon is selected, the color fills to the rounded corners */
    #firstIcon {
        border-top-left-radius: 40px;
        border-bottom-left-radius: 40px;
    }
    #lastIcon {
        border-top-right-radius: 40px;
        border-bottom-right-radius: 40px;
    }
`;

const IconContainer = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: ${widgetHeight};
    background: ${(props) => (props.selected ? selectedColor : null)};
    &:active {
        background: ${selectedColor};
    }
`;
const DeleteWidget = styled.div`
    height: ${widgetHeight};
    width: 30px;
    border-radius: 15px;
    display: flex;
    margin-left: 0.45rem;
    align-items: center;
    justify-content: center;
    background-color: ${white};
`;
function DetectionContextMenu({
    position,
    isVisible,
    selectedOption,
    setSelectedOption,
    onBoundingClicked,
    onPolygonClicked,
    onDeleteClicked,
}) {
    const handleClick = (type) => {
        if (type === editionMode.BOUNDING) {
            onBoundingClicked();
            setSelectedOption(editionMode.BOUNDING);
        } else if (type === editionMode.POLYGON) {
            onPolygonClicked();
            setSelectedOption(editionMode.POLYGON);
        } else if (type === editionMode.DELETE) {
            onDeleteClicked();
        } else {
            throw new Error(
                `${type} is not a valid option for DetectionContextMenu click`
            );
        }
    };
    return (
        isVisible && (
            <Positioner position={position}>
                <FlexContainer>
                    <MainWidget>
                        <IconContainer
                            id="firstIcon"
                            onClick={() => handleClick(editionMode.LABEL)}
                            selected={selectedOption === editionMode.LABEL}>
                            <TextIcon />
                        </IconContainer>
                        <IconContainer
                            onClick={() => handleClick(editionMode.BOUNDING)}
                            selected={selectedOption === editionMode.BOUNDING}>
                            <RectangleIcon />
                        </IconContainer>
                        <IconContainer
                            onClick={() => handleClick(editionMode.POLYGON)}
                            id="lastIcon"
                            selected={selectedOption === editionMode.POLYGON}>
                            <PolygonIcon />
                        </IconContainer>
                    </MainWidget>
                    <DeleteWidget>
                        <DeleteIcon
                            onClick={() => handleClick(editionMode.DELETE)}
                        />
                    </DeleteWidget>
                </FlexContainer>
            </Positioner>
        )
    );
}

DetectionContextMenu.propTypes = {
    position: PropTypes.object.isRequired,
    isVisible: PropTypes.bool.isRequired,
    selectedOption: PropTypes.string.isRequired,
    setSelectedOption: PropTypes.func.isRequired,
    onBoundingClicked: PropTypes.func.isRequired,
    onPolygonClicked: PropTypes.func.isRequired,
    onDeleteClicked: PropTypes.func.isRequired,
};

export default DetectionContextMenu;
