package com.tns.gen.android.view;

public class TextureView_SurfaceTextureListener_fmain_page_l315_c31__ implements android.view.TextureView.SurfaceTextureListener {
	public TextureView_SurfaceTextureListener_fmain_page_l315_c31__() {
		com.tns.Runtime.initInstance(this);
	}

	public void onSurfaceTextureAvailable(android.graphics.SurfaceTexture param_0, int param_1, int param_2)  {
		java.lang.Object[] args = new java.lang.Object[3];
		args[0] = param_0;
		args[1] = param_1;
		args[2] = param_2;
		com.tns.Runtime.callJSMethod(this, "onSurfaceTextureAvailable", void.class, args);
	}

	public void onSurfaceTextureSizeChanged(android.graphics.SurfaceTexture param_0, int param_1, int param_2)  {
		java.lang.Object[] args = new java.lang.Object[3];
		args[0] = param_0;
		args[1] = param_1;
		args[2] = param_2;
		com.tns.Runtime.callJSMethod(this, "onSurfaceTextureSizeChanged", void.class, args);
	}

	public boolean onSurfaceTextureDestroyed(android.graphics.SurfaceTexture param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		return (boolean)com.tns.Runtime.callJSMethod(this, "onSurfaceTextureDestroyed", boolean.class, args);
	}

	public void onSurfaceTextureUpdated(android.graphics.SurfaceTexture param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onSurfaceTextureUpdated", void.class, args);
	}

}
