import styled from 'styled-components';
import { ReactComponent as ExpandIconComponent } from './expand.icon.svg';
import { iconColor, iconSize } from '../24px.icon.styles';

export const StyledExpandIcon = styled(ExpandIconComponent).attrs(iconSize)`
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
            return 270;
        case 'down':
            return 0;
        case 'left':
            return 90;
        case 'up':
            return 180;
        default:
            return 0;
    }
};
