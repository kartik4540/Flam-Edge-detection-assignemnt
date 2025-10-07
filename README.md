# Android + OpenCV (C++) + OpenGL ES + TypeScript Web Viewer

This repository contains a minimal Android application that captures camera frames, processes them via OpenCV in native C++ (through JNI), and renders the output using OpenGL ES 2.0. Additionally, there is a small TypeScript web viewer to display a sample processed frame with basic stats overlay.

## Structure

- `app/`: Android application module (Kotlin/Java)
- `jni/`: Native C++ sources and OpenCV processing code
- `gl/`: Notes for OpenGL renderer organization (renderer code lives under `app/src/main/java/.../gl`)
- `web/`: TypeScript-based minimal web viewer

## Features

- Camera feed via Camera2 with `TextureView`/`SurfaceTexture`
- Frame processing with OpenCV (C++) through JNI
- Rendering with OpenGL ES 2.0 (texture-based)
- Minimal TypeScript web page to display a sample processed frame

## Setup

### Prerequisites

- Android Studio (latest), Android SDK 34
- Android NDK r26+, CMake 3.22+
- OpenCV Android SDK (4.x). Unzip and set path.

### Configure OpenCV

Option A: `local.properties`

```
opencv.dir=C:\\path\\to\\OpenCV-android-sdk
```

Then reference `${opencv.dir}/sdk/native/jni` via `OpenCV_DIR` environment variable or update `jni/CMakeLists.txt` to point to it explicitly.

Option B: Env var

Set `OpenCV_DIR` to `{OpenCV-android-sdk}/sdk/native/jni` in your environment before syncing.

### Build & Run (Android)

1. Open root folder in Android Studio.
2. Let Gradle sync and CMake configure.
3. Run the `app` configuration on a device.

Permissions: Camera is requested at runtime.

### Web Viewer

```
cd web
npm install
npm run build
npm start
```

Visit `http://localhost:8080` to view the sample frame and stats.

## Architecture

- `app` (Kotlin): Camera2 + `TextureView` for capture, `ImageReader` for YUV frames, conversion to RGBA, JNI call, and GL display using `GLSurfaceView` with a simple shader.
- `jni` (C++): Receives RGBA, uses OpenCV for grayscale/Canny; returns an 8-bit grayscale buffer.
- `gl` (Kotlin): Uploads grayscale buffer as `GL_LUMINANCE` texture; draws full-screen quad.
- `web` (TypeScript): Minimal page showing a base64 processed frame with FPS/resolution overlays.

### Controls

- Toggle button on Android switches between raw grayscale and Canny edges.
- FPS overlay shows processing throughput.

## Repo Hygiene

Commits are incremental and focused. Push to your own GitHub/GitLab remote:

```
git remote add origin <your_repo_url>
git push -u origin main
```

## License

MIT


