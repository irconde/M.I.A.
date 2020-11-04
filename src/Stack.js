/**
 * Class that holds an individual stack's information
 */
export default class Stack {
    constructor(name, view){
        this.name = name;
        this.view = view;
        this.rawData = [];
        this.blobData = [];
        this.pixelData = null;
    }
}   