package com.example.edgeviewer.gl

import android.opengl.GLES20
import android.opengl.GLSurfaceView
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10

class GrayFrameRenderer : GLSurfaceView.Renderer {
    private var program = 0
    private var texId = 0
    private var aPos = 0
    private var aTex = 0
    private var uSampler = 0

    private var frameWidth = 0
    private var frameHeight = 0
    private var pendingGray: ByteArray? = null

    private val quad: FloatBuffer = floatBufferOf(
        // x, y, u, v
        -1f, -1f, 0f, 1f,
         1f, -1f, 1f, 1f,
        -1f,  1f, 0f, 0f,
         1f,  1f, 1f, 0f
    )

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        GLES20.glClearColor(0f, 0f, 0f, 1f)
        val vs = """
            attribute vec2 aPos; 
            attribute vec2 aTex; 
            varying vec2 vTex; 
            void main(){ 
              vTex = aTex; 
              gl_Position = vec4(aPos, 0.0, 1.0); 
            }
        """.trimIndent()
        val fs = """
            precision mediump float; 
            varying vec2 vTex; 
            uniform sampler2D uTex; 
            void main(){ 
              float g = texture2D(uTex, vTex).r; 
              gl_FragColor = vec4(g, g, g, 1.0); 
            }
        """.trimIndent()
        program = buildProgram(vs, fs)
        aPos = GLES20.glGetAttribLocation(program, "aPos")
        aTex = GLES20.glGetAttribLocation(program, "aTex")
        uSampler = GLES20.glGetUniformLocation(program, "uTex")
        texId = createTexture()
    }

    override fun onSurfaceChanged(gl: GL10?, width: Int, height: Int) {
        GLES20.glViewport(0, 0, width, height)
    }

    override fun onDrawFrame(gl: GL10?) {
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT)
        uploadPendingIfAny()
        GLES20.glUseProgram(program)
        quad.position(0)
        GLES20.glEnableVertexAttribArray(aPos)
        GLES20.glVertexAttribPointer(aPos, 2, GLES20.GL_FLOAT, false, 16, quad)
        quad.position(2)
        GLES20.glEnableVertexAttribArray(aTex)
        GLES20.glVertexAttribPointer(aTex, 2, GLES20.GL_FLOAT, false, 16, quad)
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, texId)
        GLES20.glUniform1i(uSampler, 0)
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, 0)
    }

    fun updateFrame(gray: ByteArray, width: Int, height: Int) {
        // Called from GL thread via queueEvent in GLView
        frameWidth = width
        frameHeight = height
        pendingGray = gray
    }

    private fun uploadPendingIfAny() {
        val data = pendingGray ?: return
        if (frameWidth <= 0 || frameHeight <= 0) return
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, texId)
        val buf = ByteBuffer.allocateDirect(data.size)
        buf.put(data).position(0)
        // Use GL_LUMINANCE for single-channel grayscale in ES 2.0
        GLES20.glTexImage2D(
            GLES20.GL_TEXTURE_2D, 0, GLES20.GL_LUMINANCE,
            frameWidth, frameHeight, 0,
            GLES20.GL_LUMINANCE, GLES20.GL_UNSIGNED_BYTE, buf
        )
        pendingGray = null
    }

    private fun createTexture(): Int {
        val ids = IntArray(1)
        GLES20.glGenTextures(1, ids, 0)
        val id = ids[0]
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, id)
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR)
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR)
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, 0)
        return id
    }

    private fun buildProgram(vsSrc: String, fsSrc: String): Int {
        val vs = compile(GLES20.GL_VERTEX_SHADER, vsSrc)
        val fs = compile(GLES20.GL_FRAGMENT_SHADER, fsSrc)
        val prog = GLES20.glCreateProgram()
        GLES20.glAttachShader(prog, vs)
        GLES20.glAttachShader(prog, fs)
        GLES20.glLinkProgram(prog)
        val link = IntArray(1)
        GLES20.glGetProgramiv(prog, GLES20.GL_LINK_STATUS, link, 0)
        if (link[0] == 0) throw RuntimeException("Program link failed")
        GLES20.glDeleteShader(vs)
        GLES20.glDeleteShader(fs)
        return prog
    }

    private fun compile(type: Int, src: String): Int {
        val id = GLES20.glCreateShader(type)
        GLES20.glShaderSource(id, src)
        GLES20.glCompileShader(id)
        val ok = IntArray(1)
        GLES20.glGetShaderiv(id, GLES20.GL_COMPILE_STATUS, ok, 0)
        if (ok[0] == 0) throw RuntimeException("Shader compile failed")
        return id
    }
}

private fun floatBufferOf(vararg v: Float): FloatBuffer {
    val bb = ByteBuffer.allocateDirect(v.size * 4).order(ByteOrder.nativeOrder())
    val fb = bb.asFloatBuffer()
    fb.put(v)
    fb.position(0)
    return fb
}


