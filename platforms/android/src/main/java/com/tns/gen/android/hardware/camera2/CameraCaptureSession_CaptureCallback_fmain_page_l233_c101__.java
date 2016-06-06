package com.tns.gen.android.hardware.camera2;

public class CameraCaptureSession_CaptureCallback_fmain_page_l233_c101__ extends android.hardware.camera2.CameraCaptureSession.CaptureCallback implements com.tns.NativeScriptHashCodeProvider {
	public CameraCaptureSession_CaptureCallback_fmain_page_l233_c101__(){
		super();
		com.tns.Runtime.initInstance(this);
	}

	public void onCaptureProgressed(android.hardware.camera2.CameraCaptureSession param_0, android.hardware.camera2.CaptureRequest param_1, android.hardware.camera2.CaptureResult param_2)  {
		java.lang.Object[] args = new java.lang.Object[3];
		args[0] = param_0;
		args[1] = param_1;
		args[2] = param_2;
		com.tns.Runtime.callJSMethod(this, "onCaptureProgressed", void.class, args);
	}

	public void onCaptureCompleted(android.hardware.camera2.CameraCaptureSession param_0, android.hardware.camera2.CaptureRequest param_1, android.hardware.camera2.TotalCaptureResult param_2)  {
		java.lang.Object[] args = new java.lang.Object[3];
		args[0] = param_0;
		args[1] = param_1;
		args[2] = param_2;
		com.tns.Runtime.callJSMethod(this, "onCaptureCompleted", void.class, args);
	}

	public void onCaptureFailed(android.hardware.camera2.CameraCaptureSession param_0, android.hardware.camera2.CaptureRequest param_1, android.hardware.camera2.CaptureFailure param_2)  {
		java.lang.Object[] args = new java.lang.Object[3];
		args[0] = param_0;
		args[1] = param_1;
		args[2] = param_2;
		com.tns.Runtime.callJSMethod(this, "onCaptureFailed", void.class, args);
	}

	public boolean equals__super(java.lang.Object other) {
		return super.equals(other);
	}

	public int hashCode__super() {
		return super.hashCode();
	}

}
