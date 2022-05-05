export default class Ensemble {
    _bLists = [];
    _initialDetections;

    constructor(detections) {
        this._initialDetections = detections;
        this._sortDetections();
    }

    _sortDetections = () => {
        // TODO: Implement sorting algorithm where each element in _bLists is a grouping of detections in the same view with & the same classname.
    };

    toString = () => {
        // TODO: Testing method to print out the data
    };
}
