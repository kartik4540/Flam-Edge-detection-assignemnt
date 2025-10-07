package com.example.edgeviewer.gl

import android.content.Context
import android.opengl.GLSurfaceView

class GLView(context: Context) : GLSurfaceView(context) {
    private val rendererImpl = SimpleRenderer()

    init {
        setEGLContextClientVersion(2)
        setRenderer(rendererImpl)
        renderMode = RENDERMODE_CONTINUOUSLY
    }
}


