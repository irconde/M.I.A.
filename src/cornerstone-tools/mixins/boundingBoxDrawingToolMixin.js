let count = 0;
function boundingBoxDrawingToolMixin() {
    count++;
    console.log(`Count: ${count}`);
}

export default {
    boundingBoxDrawingToolMixin,
};
