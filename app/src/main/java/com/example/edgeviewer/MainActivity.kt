package com.example.edgeviewer

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.TextureView
import android.widget.FrameLayout
import android.widget.TextView
import com.example.edgeviewer.camera.CameraController
import com.example.edgeviewer.camera.CameraController.FrameListener
import com.example.edgeviewer.NativeBridge
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat

class MainActivity : ComponentActivity() {
    private lateinit var textureView: TextureView
    private lateinit var cameraController: CameraController
    private lateinit var fpsText: TextView
    private var lastTs = 0L
    private var frames = 0

    private val requestPermissions = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { _ ->
        // In a later step, start the camera when permissions are granted
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        cameraController = CameraController(this)
        val root = FrameLayout(this)
        textureView = TextureView(this)
        root.addView(textureView, FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ))
        fpsText = TextView(this).apply {
            text = "FPS: --"
            setTextColor(0xFFFFFFFF.toInt())
            setBackgroundColor(0x66000000)
            setPadding(12,12,12,12)
        }
        val lp = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT
        )
        lp.marginStart = 16
        lp.topMargin = 16
        root.addView(fpsText, lp)
        // For now, preview the camera directly to TextureView. GLView can be added later.
        setContentView(root)
        ensurePermissions()
    }

    private fun ensurePermissions() {
        val required = mutableListOf(Manifest.permission.CAMERA)
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) {
            required.add(Manifest.permission.WRITE_EXTERNAL_STORAGE)
        }
        val missing = required.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) {
            requestPermissions.launch(missing.toTypedArray())
        } else startCamera()
    }

    private fun startCamera() {
        cameraController.frameListener = object : FrameListener {
            override fun onFrameRgba(rgba: ByteArray, width: Int, height: Int) {
                // Send frame through JNI; result returned but not rendered yet
                NativeBridge.processRgba(rgba, width, height, true)
                updateFps()
            }
        }
        cameraController.start(textureView)
    }

    override fun onDestroy() {
        super.onDestroy()
        cameraController.stop()
    }

    private fun updateFps() {
        val now = System.nanoTime()
        if (lastTs == 0L) lastTs = now
        frames++
        val dt = (now - lastTs) / 1_000_000_000.0
        if (dt >= 1.0) {
            val fps = frames / dt
            runOnUiThread { fpsText.text = String.format("FPS: %.1f", fps) }
            lastTs = now
            frames = 0
        }
    }

    companion object {
        init {
            // Will load the native library later when implemented
            // System.loadLibrary("edgeproc")
        }
    }
}


