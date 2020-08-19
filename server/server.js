/**
 * Import statements
 */
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const chokidar = require('chokidar');

/**
 * Global variables
 */
const port = process.env.PORT || 4002;
const imgPath = './img/'
let fileQueue = [];
let maxFileNumber = 0;
const regExpDCS = /\.dcs$/;
const regExpFileName = /^[0-9]{1,}_{1}img\.dcs$/;

if (!fs.existsSync(imgPath)){
    fs.mkdirSync(imgPath);
}

/**
 * -----------File Watcher System and Queue Management---------------
 * ---------------------------------------------------------------------
 * The watcher applied here is the file directory watcher event handlers.
 * When certain events occur, the queue is updated based on these events
 * When a file gets saved by the server, this watcher adds it the queue
 * Same for when it is removed, the watcher updates the queue
 * This supports users putting their own files into the folder too and will 
 * serve them if they are of type .dcs, as well will rename them if they arent
 * but are of type .dcs
 */
const watcher = chokidar.watch(imgPath, {ignored: /^\./, awaitWriteFinish: false});
watcher
  .on('add', (file) => {
      console.log('File Server: File', path.resolve(file), 'has been added');
      if (validateRegExp(getFileName(file), regExpDCS)){
          if (validateRegExp(getFileName(file), regExpFileName)) {
              if (fileQueue.indexOf(file) == -1) {
                // If the file is not already in the queue add it
                fileQueue.push(file);
                if (getFileNumber(file) <= maxFileNumber) {
                    // If we are adding a file that is lower than a max file number
                    // We need to sort, otherwise, we don't need to sort.
                    fileQueue.sort((a, b) => {
                        return getFileNumber(a) - getFileNumber(b);
                    });
                }
                setMaxFileNumber();
              }
          } else {
            // Rename the file
            fs.rename(file, `${imgPath}${maxFileNumber+1}_img.dcs`, (err) => console.log(`File Server Error: ${err}`));
            console.log(`File Server: File Not Formated Properly --- Renamed file to ${imgPath}${maxFileNumber+1}_img.dcs`)
          }
      } else {
          console.log('File Server: file is not of type .dcs');
      }     
    })
  .on('change', (file) => {
      console.log('File Server: File', path.resolve(file), 'has been changed');
    })
  .on('unlink', (file) => {
      console.log('File Server: File', path.resolve(file), 'has been removed');
      const index = fileQueue.indexOf(file);
      if (index > 1){
          fileQueue.splice(index, 1);
      } else if (index === 0){
          fileQueue.shift();
      }
      setMaxFileNumber();
    })
  .on('error', (error) => {
      console.error('Error happened', error);
    })

/**
 * setMaxFileNumber() - This function is how we keep track of our max file number 
 *                    - such as maxNum_img.dcs from our file queue. This calls the 
 *                    - function getFileNumber and passes in the last element of the queue
 * @param {type} - None     
 * @return {type} - None
 */
function setMaxFileNumber() {
    if (fileQueue.length > 0){
        maxFileNumber = getFileNumber(fileQueue[fileQueue.length-1]);
    } else {
        maxFileNumber = 0;
    }
}

/**
 * getFileNumber()    - We can pull out our file number and return it to the user
 *                    - We do this by pulling apart the file name, which is a path like /static/img/1_img.dcs
 *                    - by splitting on the slashes and pulling the number off the 1_img.dcs part
 * @param {type} - None     
 * @return {type} - None
 */
function getFileNumber(file){
    var fileSplit = file.split("\\");
    return parseInt(fileSplit[fileSplit.length-1]);
}

/**
 * getFileName()      - This function simply returns the file name from whatever file we have
 * @param {type} - None     
 * @return {type} - None
 */
function getFileName(file) {
    var fileSplit = file.split("\\");
    return fileSplit[fileSplit.length-1];
}

/**
 * validateRegExp()   - We test if the regular expression we are being passed matches our file name
 *                    - This is to test if the file is of type .dcs and as well num_img.dcs
 *                    - Which are from our regular expressions defined at the top of the file
 * @param {type} - None     
 * @return {type} - None
 */
function validateRegExp(file, re){
    if (re.test(file)){
        return true;
    } else {
        return false;
    }
}

/**
 * Here we setup our express http server and the routes
 */

const router = express.Router();
const path = require('path');
const app = express();
app.use(express.json());

// Since we aren't on the same port, we have to whitelist the React App making the calls to our server
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control");
    res.header('Access-Control-Allow-Methods', 'GET,POST',)
    next();
});

// Basic alive request
router.get("/", (req, res) => {
    console.log('File Server: Alive request');
    res.send({ response: "I am alive" }).status(200);
});

// Here we serve up the next image if there is one in binary64 string
router.get("/next", (req, res) => {
    console.log('File Server: /next image serve request')
    if (fileQueue.length === 0){
        res.send({ response: "no-next-image"}).status(200);
    } else {
        try {
            if(fs.existsSync(fileQueue[0])){
                var curFile = fs.readFile(fileQueue[0], {}, (err, data) => {
                    if (err){
                        console.log(err);
                        res.send({ response: 'error'});
                    } else {
                        res.send({ b64: Buffer.from(data).toString('base64')});
                    }
                })
            } else {
                fileQueue.shift();
                if(fs.existsSync(fileQueue[0])){
                    var curFile = fs.readFile(fileQueue[0], {}, (err, data) => {
                        if (err){
                            console.log(err);
                            res.send({ response: 'error'});
                        } else {
                            res.send({ b64: Buffer.from(data).toString('base64')});
                        }
                    })
                } else {
                    res.send({ response: "no-next-image"}).status(200);
                }
            }
        } catch (error) {
            console.log(error);
            res.send({ response: 'error'});
        }     
    }
});

// This is to remove the current file from the front of the queue
// Will delete the file if it exists and return values based on what occured
router.post("/confirm", (req, res) => {
    console.log('File Server: /confirm request');
    if (req.body.valid === true){
        if (fileQueue[0]){
            fs.unlink(fileQueue[0], (err) =>{
                if (err){
                    console.log(`File Server Error: ${err}`);
                    res.send({ confirm: 'image-not-removed'});
                } else{
                    console.log('File Server: file removed successfully');
                    res.send({ confirm: 'image-removed'});
                }
            })
        } else {
            res.send({ confirm: 'no-next-image' });
        }
    } else {
        res.send({ confirm: 'image-not-removed '});
    }
})

module.exports = router;

app.use("/", router);
app.use("/next", router);
app.use("/confirm", router);


const server = http.createServer(app);
const io = socketIo(server);


/**
 * Here we create our socket io connection with the client
 * Handles the different events occuring in the socket
 */
io.on("connection", (socket) => {
    console.log('File Server: New Client Connected');
    
    socket.on("disconnect", () => {
        console.log('File Server: Client disconnected');
    })

    socket.on("fileFromClient", (binaryStr) => {
        // We received a file
        storeFile(binaryStr);
    })
});

/**
 * storeFile - Will check the total unvalidated files received
 *           - Then will store the file in order with the current
 *           - file structure
 * 
 * @param {type} data 
 */
async function storeFile(data) {
    let fileNameDir = `${imgPath}${maxFileNumber+1}_img.dcs`;
    fs.writeFile(fileNameDir, data, function(err) {
        if (err) return console.log(`File Server Error: ${err}`);
    })
}


/**
 * Finally we turn on the server to listen
 */
server.listen(port, () => console.log(`Listening on port ${port}`));