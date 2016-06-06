package com.tns.gen.android.hardware.camera2;

public class CameraDevice_StateCallback_fmain_page_l335_c75__ extends android.hardware.camera2.CameraDevice.StateCallback implements com.tns.NativeScriptHashCodeProvider {
	public CameraDevice_StateCallback_fmain_page_l335_c75__(){
		super();
		com.tns.Runtime.initInstance(this);
	}

	public void onOpened(android.hardware.camera2.CameraDevice param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onOpened", void.class, args);
	}

	public void onDisconnected(android.hardware.camera2.CameraDevice param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onDisconnected", void.class, args);
	}

	public void onError(android.hardware.camera2.CameraDevice param_0, int param_1)  {
		java.lang.Object[] args = new java.lang.Object[2];
		args[0] = param_0;
		args[1] = param_1;
		com.tns.Runtime.callJSMethod(this, "onError", void.class, args);
	}

	public void onClosed(android.hardware.camera2.CameraDevice param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onClosed", void.class, args);
	}

	public boolean equals__super(java.lang.Object other) {
		return super.equals(other);
	}

	public int hashCode__super() {
		return super.hashCode();
	}

}
