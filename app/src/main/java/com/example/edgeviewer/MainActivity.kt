package com.example.edgeviewer

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.view.TextureView
import android.widget.FrameLayout
import android.widget.LinearLayout
import com.example.edgeviewer.camera.CameraController
import com.example.edgeviewer.gl.GLView
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat

class MainActivity : ComponentActivity() {
    private lateinit var textureView: TextureView
    private lateinit var cameraController: CameraController

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
        cameraController.start(textureView)
    }

    override fun onDestroy() {
        super.onDestroy()
        cameraController.stop()
    }

    companion object {
        init {
            // Will load the native library later when implemented
            // System.loadLibrary("edgeproc")
        }
    }
}


