# Pilot GUI version 1.0

## Requirements
You will need Node.js to run and install the dependencies needed for this project. You may download it here: [nodejs.org](https://nodejs.org/) <br />

## Starting the Pilot and Server
### Structure

We assume your project structure will look similar to this:
```
D:\Documents\Pilot-1.0\dna-atr-pilot-gui
D:\Documents\Pilot-1.0\dna-atr-socket.io-server
```
It need not match this exactly, long as you have the two project folders which are the Pilot GUI and a Mock Command Server
```
dna-atr-pilot-gui
dna-atr-socket.io-server
```
### Installing Dependencies
We first need to install all the libraries and such the projects use. To do this, open a terminal and navigate to the location of your pilot folder 'dna-atr-pilot-gui.' Then run the command
```
npm install
```
This may take a minute, as it must fetch the files needed. Finally, navigate to the server folder 'dna-atr-socket.io-server' and run the same install command
```
npm i
``` 
<br />
### Getting started
<br />
You will need 2 terminals or command prompts to start the development environment. <br /><br />
First we need to start the mock command server. Navigate to the 'dna-atr-socket.io-server' folder in a terminal and begin the server with
```
node app.js
```
You will see the server begin and listen on port 4002, as well the requests made to the server are console logged. <br /><br />
Lastly, we start the Pilot GUI by running navigating to the folder of 'dna-atr-pilot.gui' and running the command: 
```
npm start
```
This will open the Pilot GUI in your web browser. As well, this starts both the file server and react development environment in parallel. 

## Structure

### Pilot GUI
Contains the React App and a File Server to manage the DICOS-TDR Images locally. The images received from the mock command server are stored in the folders directory 'img' folder in the server. <br />
```
D:\Documents\Pilot-1.0\dna-atr-pilot-gui\server\img
```
Files are removed once the Pilot GUI goes to the next image and are sent to the server mentioned below.
### Server
This acts as command server. It sends DICOS-TDR images to the React App at a set interval. As well, it saves images sent back from the Pilot GUI. <br />

The files being sent are located in the ./static/img directory.
```
D:\Documents\Pilot-1.0\dna-atr-socket.io-server\static\img
```
Each file is sent at the interval and will send all the files until the last one then ending sending anymore files. Optionally, you can set it to reset back at the start of the index and send the same files. <br /> <br /> 
To edit the interval, open app.js with your text editor or IDE
```
D:\Documents\Pilot-1.0\dna-atr-socket.io-server\app.js
```
Line 19 contains the time interval specified in MS (1000 = 1 second)
```
const TIME_INTERVAL =  2250;
```

Images returned from the Pilot GUI are located in the returned image folder
```
D:\Documents\Pilot-1.0\dna-atr-socket.io-server\static\returned
```