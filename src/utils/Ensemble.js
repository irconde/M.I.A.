// TODO: Convert this into the detections slice. Sort the BLists anytime a detection is added or deleted but now
//       simply keep the uuid reference in the BLists rather than the entire detection
export default class Ensemble {
    _bLists = new BListManager();

    constructor(detections) {
        this._sortDetections(detections);
    }

    _sortDetections = (detections) => {
        for (let i = 0; i < detections.length; i++) {
            this._bLists.addDetection(detections[i]);
        }
    };

    addDetection = (detection) => {
        this._bLists.addDetection(detection);
    };

    toString = () => {
        // TODO: Testing method to print out the data
        console.log(this._bLists._lists);
    };
}

class BListManager {
    _lists = [];
    addDetection = (detection) => {
        if (this._lists.length === 0) {
            this._lists[0] = new BList(detection.view, detection.className);
            this._lists[0].addItem(detection);
        } else {
            const index = this._lists.findIndex(
                (value) =>
                    value.view === detection.view &&
                    value.className === detection.className
            );
            if (index !== -1) {
                this._lists[index].addItem(detection);
            } else {
                this._lists.push(
                    new BList(detection.view, detection.className)
                );
                this._lists[this._lists.length - 1].addItem(detection);
            }
        }
    };
}

class BList {
    items = [];
    view = '';
    className = '';

    constructor(view, className) {
        this.view = view;
        this.className = className;
    }

    addItem = (detection) => {
        this.items.push(detection);
        if (this.items.length > 1) {
            this.items = this.items.slice().sort(this._compareConfidence);
        }
    };

    _compareConfidence = (a, b) => {
        if (a.confidence > b.confidence) return 1;
        else return -1;
    };
}
