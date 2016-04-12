# sample-cameraApp (PoC)
Sample NativeScript application showing usage of native camera api via {N} in iOS and Android (Proof of Concept).
Showing basic functionality for the camera APIs (both iOS and the new camera API for Android - camera2) 
including how to attach to a camera device and how to start a preview session.

## Usage
Connect your device or start your prefered emulator/simulator.
Tnen from the root app directory start your cmd/shell

for android
```
tns run android
```
for ios
```
tns run ios
```
Alternativly you can use the livesync command.
For better understanding of the tns commands [please follow this link](http://docs.nativescript.org/start/getting-started#development-workflow)

## Android * 
Please note that we are uing **android.hardware.camera2** api which requires at least **API Level 21** 
The application is showing the basic concepts behind camera2 API and allows you to start a CameraPreviewSession.. Also how to get the available cameras and their characteristics and use them to improve your camera app.
Also an exmaple of how to use **CameraCaptureSession.CaptureCallback** and how to use the current states
to capture pictures.


## iOS * 
For iOS we are using AVCaptureSession to start a preview in the CaptureVideoPreview in a video layer which we attach to the current view.


