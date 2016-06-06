package com.tns.gen.android.hardware.camera2;

public class CameraCaptureSession_StateCallback_fmain_page_l123_c107__ extends android.hardware.camera2.CameraCaptureSession.StateCallback implements com.tns.NativeScriptHashCodeProvider {
	public CameraCaptureSession_StateCallback_fmain_page_l123_c107__(){
		super();
		com.tns.Runtime.initInstance(this);
	}

	public void onConfigured(android.hardware.camera2.CameraCaptureSession param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onConfigured", void.class, args);
	}

	public void onConfigureFailed(android.hardware.camera2.CameraCaptureSession param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onConfigureFailed", void.class, args);
	}

	public boolean equals__super(java.lang.Object other) {
		return super.equals(other);
	}

	public int hashCode__super() {
		return super.hashCode();
	}

}
