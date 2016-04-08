var app = require('application');

var output;
var wantedCamera;

function onNavigatingTo(args) {
    var page = args.object;
}
exports.onNavigatingTo = onNavigatingTo;

function onTakeShot(args) {
    if (app.ios) {
        var videoConnection = output.connections[0];
        output.captureStillImageAsynchronouslyFromConnectionCompletionHandler(videoConnection, function (buffer, error) {
            var imageData = AVCaptureStillImageOutput.jpegStillImageNSDataRepresentation(buffer);
            var image = UIImage.imageWithData(imageData);
            UIImageWriteToSavedPhotosAlbum(image, null, null, null);
            AudioServicesPlaySystemSound(144);
        });
    }
}
exports.onTakeShot = onTakeShot;

function onCreatingView(args) {
    if (app.ios) {
        var session = new AVCaptureSession();
        session.sessionPreset = AVCaptureSessionPreset1280x720;

        // Adding capture device
        var device = AVCaptureDevice.defaultDeviceWithMediaType(AVMediaTypeVideo);
        var input = AVCaptureDeviceInput.deviceInputWithDeviceError(device, null);
        if (!input) {
            throw new Error("Error trying to open camera.");
        }
        session.addInput(input);

        output = new AVCaptureStillImageOutput();
        session.addOutput(output);

        session.startRunning();
        
        var videoLayer = AVCaptureVideoPreviewLayer.layerWithSession(session);
        
        var view = UIView.alloc().initWithFrame({ origin: { x: 0, y: 0 }, size: { width: 400, height: 600 } });
        videoLayer.frame = view.bounds;
        view.layer.addSublayer(videoLayer);
        args.view = view;
               
    } else if (app.android) {
        var appContext = app.android.context;
        var cameraManager = appContext.getSystemService(android.content.Context.CAMERA_SERVICE);
        
        var cameras = cameraManager.getCameraIdList();
        console.log("total cameras: " + cameras.length);
        
        for (var index = 0; index < cameras.length; index++) {
            var currentCamera = cameras[index];
            var currentCameraSpecs = cameraManager.getCameraCharacteristics(currentCamera);
            
            var facing = currentCameraSpecs.get(android.hardware.camera2.CameraCharacteristics.LENS_FACING);

            if(facing !== null && facing == android.hardware.camera2.CameraCharacteristics.LENS_FACING_BACK) {
                console.log("get BACK camera");
                
                wantedCamera = currentCamera;
                console.log(wantedCamera);
            }
        }
        
        // cameraManager.openCamera(wantedCamera, ) // give camera , callback , handler
    }
    
}
exports.onCreatingView = onCreatingView;