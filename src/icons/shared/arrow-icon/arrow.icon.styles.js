import { ReactComponent as ExpandArrowIconComponent } from './arrow.icon.svg';
import styled from 'styled-components';
import { iconColor, iconSize } from '../24px.icon.styles';

export const StyledArrowIcon = styled(ExpandArrowIconComponent).attrs(iconSize)`
    transform: rotate(${(props) => getRotationAngle(props.direction)}deg);
    ${iconColor}
`;

/**
 * Converts a string direction into an the proper angle with accordance to the
 * expand arrow icon. Right marks the 0 degree starting point
 *
 * @param {string} direction - string direction
 * @returns {number}
 */
const getRotationAngle = (direction) => {
    switch (direction) {
        case 'right':
            return 0;
        case 'down':
            return 90;
        case 'left':
            return 180;
        case 'up':
            return 270;
        default:
            return 0;
    }
};
