# Pilot GUI version 1.1.1

The Pilot GUI is conceived as the client side of the decision support system developed in the pilot project. This client has the primary goal of allowing the end-user - that is, the x-ray machine operator - to visually check the multiple detections or objects identified as potentially of interest by the system itself.

Through this client, the pilot system provides the user with visual feedback on the results derived from the different deep learning workflows executed on the server side. The several algorithms that constitute the business logic are implemented as a remote service, while the client is conceived as a tool that allows the user to efficiently and effectively inspect the detections received in the form of DICOS+TDR files packed in an tailored OpenRaster (ORA) file.

In particular, the project contains a React App and a File Queue Server to manage locally the DICOS-TDR images received from the server. The ORA files are stored temporarily in the 'img' folder inside the server directory.

```
<ROOT>\server\img
```

Every ORA file will be removed from the Pilot GUI local storage once the operator finishes validating the detections included in all the related DICOS file processed and navigates to the next one.

## Build and development pre-requisites

The installation of both [nodejs](https://nodejs.org/) and npm is required for the proper build of the client. 

Additionally, the Pilot GUI is intended to connect to, and work with a remote server. It will be necessary to have a web server up and running, able to send ORA files to the client. 

[Here](https://bitbucket.org/eac-ualr/dna-atr-socket.io-server/src/master/) you can find the code of a mock file server that can be used for development and testing purposes. More information on how to use the server below.

## Installation of dependencies

Access the root folder of the project from a terminal and run the following command:

```
npm install
```

## Starting the client in development mode

Again, using terminal and being at the root folder of the project, it is possible to start the client in development mode by using this command:

```
REACT_APP_COMMAND_SERVER=http://<SERVER_IP>:<SERVER_PORT> npm start
```

Note that we use the environment variable  REACT_APP_COMMAND_SERVER to launch the client with a given ip and port number. Thus, for example, if the client has to be connected to a service runing on a machine with the 127.0.0.1 ip number and through the 4001 port,  the command to be used is:

```
REACT_APP_COMMAND_SERVER=http://127.0.0.1:4001 npm start
```

## Building the client

To create an optimized production build run from the terminal the following command:

```
npm run build
```

As a result, a build folder is created with all the necessary files. At that point, the build folder is ready to be deployed. You may serve it with a static server:

```
yarn global add serve
serve -s build
```

## Mock file server

You can test the client developed in this project using a mock server that can be accessed in [this code repository](https://bitbucket.org/eac-ualr/dna-atr-socket.io-server/src/master/). This server acts as substitute of the actual command server of the Pilot system. It sends ORA files to the react-based client at a given interval, and it also manages the persistence of the amended ORA files sent back from the Pilot GUI.

The files being sent are located in the "static/img" directory.

```
<ROOT>\static\img
```

Each file is sent at the given interval and will send all the files until the last one then ending sending anymore files. Optionally, you can set it to reset back at the start of the index and send the same files. 

Images returned from the Pilot GUI are saved in the "returned" image folder

```
<ROOT>\static\returned
```

### Getting started

Once cloned the repository in your machine, access the root folder of the project from the terminal. To install the required dependencies run the following command:

```
npm i
```

Then, before launching the client, it's necessary to start the mock server:

```
node app.js
```

The server gets started and remains listening on port 4001. During the server's life, log messages are provided on the terminal for debugging purposes.