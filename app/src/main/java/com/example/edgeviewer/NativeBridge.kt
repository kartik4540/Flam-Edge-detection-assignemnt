package com.example.edgeviewer

object NativeBridge {
    init {
        try {
            System.loadLibrary("edgeproc")
        } catch (t: Throwable) {
            // Library may not load until CMake is configured; ignore for now.
        }
    }

    external fun stringFromJNI(): String
    external fun processRgba(inputRgba: ByteArray, width: Int, height: Int, useCanny: Boolean): ByteArray?
}


