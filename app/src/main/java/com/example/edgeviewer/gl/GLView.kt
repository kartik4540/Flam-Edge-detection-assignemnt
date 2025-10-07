package com.example.edgeviewer.gl

import android.content.Context
import android.opengl.GLSurfaceView

class GLView(context: Context) : GLSurfaceView(context) {
    private val rendererImpl = GrayFrameRenderer()

    init {
        setEGLContextClientVersion(2)
        setRenderer(rendererImpl)
        renderMode = RENDERMODE_WHEN_DIRTY
    }

    fun setGrayFrame(data: ByteArray, width: Int, height: Int) {
        queueEvent {
            rendererImpl.updateFrame(data, width, height)
            requestRender()
        }
    }
}


