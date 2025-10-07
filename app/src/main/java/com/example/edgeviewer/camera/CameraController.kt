package com.example.edgeviewer.camera

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.SurfaceTexture
import android.hardware.camera2.*
import android.os.Handler
import android.os.HandlerThread
import android.util.Size
import android.view.Surface
import android.view.TextureView
import android.media.ImageReader
import android.media.Image
import java.nio.ByteBuffer

class CameraController(private val context: Context) {
    private var cameraDevice: CameraDevice? = null
    private var captureSession: CameraCaptureSession? = null
    private var backgroundThread: HandlerThread? = null
    private var backgroundHandler: Handler? = null
    private var imageReader: ImageReader? = null

    interface FrameListener {
        fun onFrameRgba(rgba: ByteArray, width: Int, height: Int)
    }

    var frameListener: FrameListener? = null

    fun start(textureView: TextureView, preferredSize: Size = Size(1280, 720)) {
        startBackgroundThread()
        if (textureView.isAvailable) {
            openCamera(textureView, preferredSize)
        } else {
            textureView.surfaceTextureListener = object : TextureView.SurfaceTextureListener {
                override fun onSurfaceTextureAvailable(surface: SurfaceTexture, width: Int, height: Int) {
                    openCamera(textureView, preferredSize)
                }
                override fun onSurfaceTextureSizeChanged(surface: SurfaceTexture, width: Int, height: Int) {}
                override fun onSurfaceTextureDestroyed(surface: SurfaceTexture): Boolean = true
                override fun onSurfaceTextureUpdated(surface: SurfaceTexture) {}
            }
        }
    }

    fun stop() {
        captureSession?.close()
        captureSession = null
        cameraDevice?.close()
        cameraDevice = null
        stopBackgroundThread()
    }

    @SuppressLint("MissingPermission")
    private fun openCamera(textureView: TextureView, preferredSize: Size) {
        val manager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
        val cameraId = manager.cameraIdList.first { id ->
            val chars = manager.getCameraCharacteristics(id)
            val facing = chars.get(CameraCharacteristics.LENS_FACING)
            facing == CameraCharacteristics.LENS_FACING_BACK
        }
        manager.openCamera(cameraId, object : CameraDevice.StateCallback() {
            override fun onOpened(device: CameraDevice) {
                cameraDevice = device
                startPreview(textureView, preferredSize)
            }
            override fun onDisconnected(device: CameraDevice) { device.close() }
            override fun onError(device: CameraDevice, error: Int) { device.close() }
        }, backgroundHandler)
    }

    private fun startPreview(textureView: TextureView, preferredSize: Size) {
        val device = cameraDevice ?: return
        val texture = textureView.surfaceTexture ?: return
        texture.setDefaultBufferSize(preferredSize.width, preferredSize.height)
        val surface = Surface(texture)
        // ImageReader for CPU-accessible frames
        imageReader?.close()
        imageReader = ImageReader.newInstance(
            preferredSize.width,
            preferredSize.height,
            android.graphics.ImageFormat.YUV_420_888,
            3
        ).also { reader ->
            reader.setOnImageAvailableListener({ r ->
                val img = r.acquireLatestImage() ?: return@setOnImageAvailableListener
                try {
                    val rgba = yuv420ToRgba(img)
                    frameListener?.onFrameRgba(rgba, img.width, img.height)
                } finally {
                    img.close()
                }
            }, backgroundHandler)
        }
        val readerSurface = imageReader!!.surface
        val requestBuilder = device.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW).apply {
            addTarget(surface)
            addTarget(readerSurface)
            set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO)
        }
        device.createCaptureSession(listOf(surface, readerSurface), object : CameraCaptureSession.StateCallback() {
            override fun onConfigured(session: CameraCaptureSession) {
                captureSession = session
                session.setRepeatingRequest(requestBuilder.build(), null, backgroundHandler)
            }
            override fun onConfigureFailed(session: CameraCaptureSession) {}
        }, backgroundHandler)
    }

    private fun startBackgroundThread() {
        backgroundThread = HandlerThread("CameraBackground").also { it.start() }
        backgroundHandler = Handler(backgroundThread!!.looper)
    }

    private fun stopBackgroundThread() {
        backgroundThread?.quitSafely()
        backgroundThread?.join()
        backgroundThread = null
        backgroundHandler = null
    }

    private fun yuv420ToRgba(image: Image): ByteArray {
        val width = image.width
        val height = image.height
        val yBuffer = image.planes[0].buffer
        val uBuffer = image.planes[1].buffer
        val vBuffer = image.planes[2].buffer
        val yRowStride = image.planes[0].rowStride
        val uvRowStride = image.planes[1].rowStride
        val uvPixelStride = image.planes[1].pixelStride

        val out = ByteArray(width * height * 4)
        var outIdx = 0
        val yBytes = yBuffer.toByteArray()
        val uBytes = uBuffer.toByteArray()
        val vBytes = vBuffer.toByteArray()

        for (j in 0 until height) {
            val pY = j * yRowStride
            val pUV = (j / 2) * uvRowStride
            for (i in 0 until width) {
                val y = 0xFF and yBytes[pY + i].toInt()
                val uvIndex = pUV + (i / 2) * uvPixelStride
                val u = 0xFF and uBytes[uvIndex].toInt()
                val v = 0xFF and vBytes[uvIndex].toInt()
                val c = y - 16
                val d = u - 128
                val e = v - 128
                var r = (298 * c + 409 * e + 128) shr 8
                var g = (298 * c - 100 * d - 208 * e + 128) shr 8
                var b = (298 * c + 516 * d + 128) shr 8
                if (r < 0) r = 0 else if (r > 255) r = 255
                if (g < 0) g = 0 else if (g > 255) g = 255
                if (b < 0) b = 0 else if (b > 255) b = 255
                out[outIdx++] = r.toByte()
                out[outIdx++] = g.toByte()
                out[outIdx++] = b.toByte()
                out[outIdx++] = 0xFF.toByte()
            }
        }
        return out
    }
}

private fun ByteBuffer.toByteArray(): ByteArray {
    val bytes = ByteArray(remaining())
    get(bytes)
    rewind()
    return bytes
}


