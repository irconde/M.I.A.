export const iconColor = `
    fill: ${(props) => props.color};
`;

export const iconSize = (props) => ({
    width: props.width || '24px',
    height: props.height || '24px',
});
