# M.I.A. Medical Imaging Annotation Tool

M.I.A. is a cross-platform medical imaging annotation tool specifically designed for desktop systems. It empowers computer vision and healthcare researchers to effortlessly generate datasets tailored for training advanced machine learning algorithms, thereby enabling accurate diagnostics on medical imaging in the standard DICOM format.

## Build and development pre-requisites

The installation of both [nodejs](https://nodejs.org/) and npm is required for the proper build of the client.

## Installation of dependencies

Access the root folder of the project from a terminal and run the following command:

```
npm install
```

## Starting the client in development mode

### Web Client

Again, using terminal and being at the root folder of the project, it is possible to start the client in development
mode by using this command:

```
npm start
```

### Desktop Client

Same as above but this time running the command:

```
npm run start-electron
```

## Building the client

### Web Client

To create an optimized production build run from the terminal the following command:

```
npm run build
```

As a result, a build folder is created with all the necessary files. At that point, the build folder is ready to be
deployed. You may serve it with a static server:

```
yarn global add serve
serve -s build
```

### Desktop Client

To create an optimized production build run from the terminal the following command:

```
npm run build-electron
```

This will create an installer, based on the Operating System built on, in the `./dist` folder. For e.g., built on
Windows results in `./dist/Pilot GUI Setup version.number.exe`. Once installed, you can simply launch the Desktop like
any other application.